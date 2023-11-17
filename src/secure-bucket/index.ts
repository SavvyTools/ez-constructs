import { Duration, Stack } from 'aws-cdk-lib';
import { Effect, PolicyStatement, StarPrincipal } from 'aws-cdk-lib/aws-iam';
import {
  BlockPublicAccess,
  Bucket,
  BucketEncryption,
  BucketProps, IBucket,
  LifecycleRule,
  StorageClass,
} from 'aws-cdk-lib/aws-s3';
import { Transition } from 'aws-cdk-lib/aws-s3/lib/rule';
import { Construct } from 'constructs';
import * as _ from 'lodash';
import { EzConstruct } from '../ez-construct';
import { Utils } from '../lib/utils';

/**
 * Will create a secure bucket with the following features:
 * - Bucket name will be modified to include account and region.
 * - Access limited to the owner
 * - Object Versioning
 * - Encryption at rest
 * - Object expiration max limit to 10 years
 * - Object will transition to IA after 60 days and later to deep archive after 365 days
 *
 * Example:
 *
 * ```ts
 *    let aBucket = new SecureBucket(mystack, 'secureBucket', {
 *      bucketName: 'mybucket',
 *      objectsExpireInDays: 500,
 *      enforceSSL: false,
 *     });
 * ```
 */
export class SecureBucket extends EzConstruct {

  private _bucket: Bucket | undefined;
  private _bucketName: string | undefined;
  private _props: BucketProps | undefined;
  private _logsBucket: IBucket | undefined;

  private _moveToGlacierDeepArchive = false;
  private _moveToGlacierInstantRetrieval = false;
  private _objectsExpireInDays = 3650;
  private _noncurrentObjectsExpireInDays = 90;
  private readonly scope: Construct;
  // @ts-ignore
  private readonly id: string;
  private _restrictToIpOrCidrs: Array<string> = [];
  private _restrictToVpcIds: Array<string> = [];

  /**
   * Creates the SecureBucket
   * @param scope - the stack in which the construct is defined.
   * @param id - a unique identifier for the construct.
   */
  constructor(scope: Construct, id: string) {
    super(scope, id);
    this.id = id;
    this.scope = scope;
  }

  /**
   * The underlying S3 bucket created by this construct.
   */
  get bucket(): Bucket | undefined {
    return this._bucket;
  }

  /**
   * Adds access restrictions so that the access is allowed from the following IP ranges
   * @param ipsOrCidrs
   */
  restrictAccessToIpOrCidrs(ipsOrCidrs: Array<string>): SecureBucket {
    this._restrictToIpOrCidrs.push(...ipsOrCidrs);
    return this;
  }
  /**
   * Adds access restrictions so that the access is allowed from the following VPCs
   * @param vpcIds
   */
  restrictAccessToVpcs(vpcIds: Array<string>): SecureBucket {
    this._restrictToVpcIds.push(...vpcIds);
    return this;
  }

  /**
   * The name of the bucket. Internally the bucket name will be modified to include the account and region.
   * @param name - the name of the bucket to use
   */
  bucketName(name: string): SecureBucket {
    this._bucketName = name;
    return this;
  }

  /**
   * Use only for buckets that have archiving data.
   * CAUTION, once the object is archived, a temporary bucket copy is needed to restore the data.
   * @default false
   * @returns SecureBucket
   */
  moveToGlacierDeepArchive(move?: boolean): SecureBucket {
    this._moveToGlacierDeepArchive = move ?? false;
    return this;
  }
  /**
   * Use only for buckets that have archiving data.
   * @default false
   * @returns SecureBucket
   */
  moveToGlacierInstantRetrieval(move?: boolean): SecureBucket {
    this._moveToGlacierInstantRetrieval = move ?? false;
    return this;
  }

  /**
   * The number of days that object will be kept.
   * @default 3650 - 10 years
   * @returns SecureBucket
   */
  objectsExpireInDays(expiryInDays: number): SecureBucket {
    this._objectsExpireInDays = expiryInDays;
    return this;
  }

  /**
   * The number of days that non current version of object will be kept.
   * @default 90 days
   * @returns SecureBucket
   */
  nonCurrentObjectsExpireInDays(expiryInDays: number): SecureBucket {
    this._noncurrentObjectsExpireInDays = expiryInDays;
    return this;
  }

  /**
   * Will enable the access logs to the given bucket
   * @param logsBucket
   */
  accessLogsBucket(logsBucket: IBucket): SecureBucket {
    this._logsBucket = logsBucket;
    return this;
  }

  /**
   * Adds restriction to the bucket based on IP/CIDRs or VPC IDs specified.
   * @param bucket - the bucket
   */
  private addRestrictionPolicy(bucket:Bucket): void {
    let conditions: { [key: string]: any } = {};

    if (this._restrictToIpOrCidrs.length > 0) {
      conditions.NotIpAddress = { 'aws:SourceIp': this._restrictToIpOrCidrs };
    }

    if (this._restrictToVpcIds.length > 0) {
      conditions.StringNotEquals = { 'aws:SourceVpce': this._restrictToVpcIds };
    }

    if (_.isEmpty(conditions)) return;

    bucket.addToResourcePolicy(new PolicyStatement({
      effect: Effect.DENY,
      principals: [new StarPrincipal()],
      actions: ['s3:*'],
      resources: [`${bucket.bucketArn}/*`],
      conditions: conditions,
    }));

  }

  private generateLifeCycleRule(): LifecycleRule[] {
    let objectsExpireInDays = this._objectsExpireInDays ?? 3650; // 10 years
    let moveToGlacierDeepArchive = this._moveToGlacierDeepArchive ?? false;
    let moveToGlacierInstantRetrieval = this._moveToGlacierInstantRetrieval ?? false;
    let transitions:Transition[] = [];
    let lifecycleRules = [
      {
        expiration: Duration.days(objectsExpireInDays),
        abortIncompleteMultipartUploadAfter: Duration.days(30),
        transitions: transitions,
        noncurrentVersionExpiration: Duration.days(this._noncurrentObjectsExpireInDays),
        noncurrentVersionTransitions: [
          { storageClass: StorageClass.GLACIER_INSTANT_RETRIEVAL, transitionAfter: Duration.days(3) },
        ],
      },
    ];

    if (objectsExpireInDays <= 30) return lifecycleRules;

    if (moveToGlacierDeepArchive && objectsExpireInDays >= 365) {
      transitions.push({ storageClass: StorageClass.DEEP_ARCHIVE, transitionAfter: Duration.days(365) });
    }

    if (moveToGlacierInstantRetrieval) {
      transitions.push({ storageClass: StorageClass.GLACIER_INSTANT_RETRIEVAL, transitionAfter: Duration.days(30) });
    } else {
      transitions.push({ storageClass: StorageClass.INTELLIGENT_TIERING, transitionAfter: Duration.days(30) });
    }

    return lifecycleRules;
  }

  /**
   * This function allows users to override the defaults calculated by this construct and is only recommended for advanced usecases.
   * The values supplied via props superseeds the defaults that are calculated.
   * @param props - The customized set of properties
   * @returns SecureBucket
   */
  overrideBucketProperties(props: BucketProps): SecureBucket {

    // canonicalize the bucket name
    let currentScope = this.scope;
    const stack = Stack.of(currentScope);
    let bucketName = Utils.appendIfNecessary(_.toLower(this._bucketName), stack.account, stack.region);

    // create the defaults
    let encryption = BucketEncryption.S3_MANAGED;
    let versioned = true;
    let enforceSSL = true;
    let publicReadAccess = false;

    // block access if necessary
    let blockPublicAccess = (!publicReadAccess ? BlockPublicAccess.BLOCK_ALL : undefined);
    let lifecycleRules = this.generateLifeCycleRule();
    let serverAccessLogsBucket = props.serverAccessLogsBucket ?? this._logsBucket;
    let defaultPrefix = `${this._bucketName}/`;
    let serverAccessLogsPrefix = serverAccessLogsBucket ? props.serverAccessLogsPrefix ?? defaultPrefix: undefined;

    // override bucket props with defaults
    let bucketProps = Object.assign({}, {
      bucketName,
      encryption,
      versioned,
      enforceSSL,
      publicReadAccess,
      blockPublicAccess,
      lifecycleRules,
      serverAccessLogsBucket,
      serverAccessLogsPrefix,
    }, props);

    this._props = bucketProps;
    return this;
  }

  /**
   * Creates the underlying S3 bucket.
   */
  assemble(): SecureBucket {

    if (this._props === undefined) {
      this.overrideBucketProperties({});
    }

    let newBucket = new Bucket(this, 'Bucket', this._props);
    // add restrictions as needed.
    this.addRestrictionPolicy(newBucket);
    this._bucket = newBucket;

    // disable s3 access log enfocement
    Utils.suppressNagRule(this._bucket, 'AwsSolutions-S1');

    return this;
  }


}