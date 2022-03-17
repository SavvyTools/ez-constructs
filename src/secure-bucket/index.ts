import { Duration, Stack } from 'aws-cdk-lib';
import { BlockPublicAccess, Bucket, BucketEncryption, BucketProps, StorageClass } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import * as _ from 'lodash';
import { Utils } from '../lib/utils';

/**
 * Properties for a bucket
 */
export interface SecureBucketProps extends BucketProps {

  /**
     * The number of days that object will be kept.
     * @default 3650 - 10 years
     */
  readonly objectsExpireInDays?: number;

  /**
     * Use only for buckets that have archiving data.
     * CAUTION, once the object is archived, a temporary bucket to store the data.
     * @default false
     */
  readonly moveToGlacierDeepArchive?: boolean;
}

/**
 * Will create a secure bucket with the following features:
 * - Bucket name will be modified to include account and region.
 * - Access limited to the owner
 * - Object Versioning
 * - Encryption at rest
 * - Object expiration max limit to 10 years
 * - Object will transition to IA after 60 days and later to deep archive after 365 days
 */
export class SecureBucket extends Construct {

  public readonly bucket: Bucket;

  /**
   *
   * @param scope - the stack in which the construct is defined.
   * @param id - a unique identifier for the construct.
   * @param props - the customized set of properies. The `bucketName` property must be set.
   */
  constructor(scope: Construct, id: string, props: SecureBucketProps) {
    super(scope, id);

    // canonicalize the bucket name
    const stack = Stack.of(scope);
    let bucketName = Utils.appendIfNecessary(_.toLower(props.bucketName), stack.account, stack.region);

    // create the defaults
    let encryption = props.encryption ?? BucketEncryption.S3_MANAGED;
    let versioned = props.versioned ?? true;
    let enforceSSL = props.enforceSSL ?? true;
    let publicReadAccess = props.publicReadAccess ?? false;
    let objectsExpireInDays = props.objectsExpireInDays ?? 3650; // 10 years
    let moveToGlacierDeepArchive = props.moveToGlacierDeepArchive ?? false;

    // block access if necessary
    let blockPublicAccess = props.blockPublicAccess ?? (!publicReadAccess ? BlockPublicAccess.BLOCK_ALL : undefined);

    // will add transitions if expiry set on object is >90 days.
    let transitions = [];
    if (objectsExpireInDays >= 60) {
      transitions.push({ storageClass: StorageClass.INFREQUENT_ACCESS, transitionAfter: Duration.days(30) });
    }
    if (objectsExpireInDays >= 90) {
      transitions.push({ storageClass: StorageClass.INTELLIGENT_TIERING, transitionAfter: Duration.days(60) });
    }
    if (moveToGlacierDeepArchive && objectsExpireInDays >= 365) {
      transitions.push({ storageClass: StorageClass.DEEP_ARCHIVE, transitionAfter: Duration.days(90) });
    }

    let lifecycleRules = props.lifecycleRules || [
      {
        expiration: Duration.days(objectsExpireInDays),
        abortIncompleteMultipartUploadAfter: Duration.days(30),
        transitions: transitions,
      },
    ];

    // override bucket props with defaults
    let bucketProps = Object.assign({}, props, {
      bucketName,
      encryption,
      versioned,
      enforceSSL,
      publicReadAccess,
      blockPublicAccess,
      lifecycleRules,
    });

    this.bucket = new Bucket(this, id, bucketProps);
  }
}