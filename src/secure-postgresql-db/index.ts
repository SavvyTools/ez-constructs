import * as cdk from '@aws-cdk/core';
import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import { BackupPlan, BackupPlanRule, BackupPlanRuleProps, BackupResource } from 'aws-cdk-lib/aws-backup';
import { Alarm, ComparisonOperator } from 'aws-cdk-lib/aws-cloudwatch';
import { SnsAction } from 'aws-cdk-lib/aws-cloudwatch-actions';
import { ISecurityGroup, IVpc, InstanceType, Port, SecurityGroup, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Schedule } from 'aws-cdk-lib/aws-events';
import { Key } from 'aws-cdk-lib/aws-kms';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { CfnDBInstance, Credentials, DatabaseInstance, DatabaseInstanceEngine, ParameterGroup, PostgresEngineVersion } from 'aws-cdk-lib/aws-rds';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { Construct, IConstruct } from 'constructs';
import _ from 'lodash';
import { EzConstruct } from '../ez-construct';
import { Defaults } from '../lib/defaults';
import { Utils } from '../lib/utils';


interface SecurePostgresqlDbProps {
  vpcId: string;
  cloudWatchLogRetention?: RetentionDays;
  postgresEngineVersion?: PostgresEngineVersion;
  instanceIdentifier?: string | null;
  instanceType: InstanceType;
  port?: number;
  overrideInstanceProps?: { [key: string]: any } | {};
  additionalSecurityGroups?: ISecurityGroup[];
  allocatedStorage?: number;
  maxAllocatedStorage?: number;
  multiAz?: boolean;
  backupPlanRuleProps?: BackupPlanRuleProps;
  alarmProps?: {
    minFreeMemoryMB?: number;
    maxOpenConnections?: number;
    freeStorageThresholdPct?: number;
  };
  snapshotArn?: string | null;
}


export class SecurePostgresqlDb extends EzConstruct {
  public encryptionKey: Key;
  public instance: DatabaseInstance;
  public credentialSecret: Secret;
  public securityGroup: SecurityGroup;
  public backupPlan: BackupPlan;
  public alarms: Alarm[];

  private _props: SecurePostgresqlDbProps;
  private _vpc: IVpc;

  private _defaultProps: Defaults<SecurePostgresqlDbProps> = {
    cloudWatchLogRetention: RetentionDays.THREE_MONTHS,
    postgresEngineVersion: PostgresEngineVersion.VER_15_3,
    instanceIdentifier: null,
    port: 5432,
    allocatedStorage: 50,
    maxAllocatedStorage: 200,
    multiAz: false,
    overrideInstanceProps: { deletionProtection: false },
    additionalSecurityGroups: [],
    backupPlanRuleProps: {
      completionWindow: Duration.hours(4),
      startWindow: Duration.hours(1),
      // Midnight, every night
      scheduleExpression: Schedule.cron({
        day: '*',
        hour: '0',
        minute: '0',
      }),
      deleteAfter: Duration.days(60),
    },
    alarmProps: {
      minFreeMemoryMB: 1024,
      maxOpenConnections: 100,
      freeStorageThresholdPct: 20,
    },
    snapshotArn: null,
  };

  private _productionDefaults = {
    overrideInstanceProps: { deletionProtection: true },
    cloudWatchLogRetention: RetentionDays.ONE_YEAR,
    multiAz: true,
    backupPlanRuleProps: {
      deleteAfter: Duration.days(3650),
    },
  };

  constructor(scope: Construct, id: string, props?: SecurePostgresqlDbProps) {
    super(scope, id);
    this.alarms = [];

    // merge passed options and defaults
    this._props = Object.assign({}, this._defaultProps, props);
  }

  /**
 * The id for the VPC in which to create the database.
 * @param vpcId
 * @returns SecurePostgresqlDb
 */
  public vpcId(vpcId: string): SecurePostgresqlDb {
    this._props.vpcId = vpcId;
    return this;
  }

  /**
  * Cloudwatch log retention period.
  * @param cloudWatchLogRetention
  * @default RetentionDays.THREE_MONTHS
  * @returns SecurePostgresqlDb
  */
  public cloudWatchLogRetention(cloudWatchLogRetention: RetentionDays): SecurePostgresqlDb {
    this._props.cloudWatchLogRetention = cloudWatchLogRetention;
    return this;
  }

  /**
  * Postgres Engine Version.
  * https://docs.aws.amazon.com/AmazonRDS/latest/PostgreSQLReleaseNotes/postgresql-versions.html
  * @param postgresEngineVersion
  * @default PostgresEngineVersion.VER_15_3
  * @returns SecurePostgresqlDb
  */
  public postgresEngineVersion(postgresEngineVersion: PostgresEngineVersion): SecurePostgresqlDb {
    this._props.postgresEngineVersion = postgresEngineVersion;
    return this;
  }

  /**
  * Instance identifier (name) for the RDS instance.
  * @param instanceIdentifier
  * @returns SecurePostgresqlDb
  */
  public instanceIdentifier(instanceIdentifier: string): SecurePostgresqlDb {
    this._props.instanceIdentifier = instanceIdentifier;
    return this;
  }

  /**
  * RDS Instance Type
  * https://aws.amazon.com/rds/instance-types/
  * @param instanceType
  * @returns SecurePostgresqlDb
  */
  public instanceType(instanceType: InstanceType): SecurePostgresqlDb {
    this._props.instanceType = instanceType;
    return this;
  }

  /**
  * TCP port on which the database will listen.
  * @param port
  * @default 5432
  * @returns SecurePostgresqlDb
  */
  public port(port: number): SecurePostgresqlDb {
    this._props.port = port;
    return this;
  }

  /**
  * This function allows users to override the defaults calculated by this construct and is only recommended for advanced usecases.
  * The values supplied via props superseeds the defaults that are calculated.
  * @param overrideInstanceProps
  * @returns SecurePostgresqlDb
  */
  public overrideInstanceProps(overrideInstanceProps: { [key: string]: any }): SecurePostgresqlDb {
    this._props.overrideInstanceProps = overrideInstanceProps;
    return this;
  }

  /**
  * Additional security groups to apply to the DB instance, in additional to construct-created group.
  * @param additionalSecurityGroups
  * @returns SecurePostgresqlDb
  */
  public additionalSecurityGroups(additionalSecurityGroups: ISecurityGroup[]): SecurePostgresqlDb {
    this._props.additionalSecurityGroups = additionalSecurityGroups;
    return this;
  }

  /**
  * Initial allocated storage for the DB.
  * https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_rds.DatabaseInstance.html#allocatedstorage
  * @param allocatedStorage
  * @default 50
  * @returns SecurePostgresqlDb
  */
  public allocatedStorage(allocatedStorage: number): SecurePostgresqlDb {
    this._props.allocatedStorage = allocatedStorage;
    return this;
  }

  /**
  * Maximum allocated storage for the DB.
  * https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_rds.DatabaseInstance.html#maxallocatedstorage
  * @param maxAllocatedStorage
  * @default 200
  * @returns SecurePostgresqlDb
  */
  public maxAllocatedStorage(maxAllocatedStorage: number): SecurePostgresqlDb {
    this._props.maxAllocatedStorage = maxAllocatedStorage;
    return this;
  }

  /**
  * Whether the database should be Multi-AZ.
  * https://aws.amazon.com/rds/features/multi-az/
  * @param multiAz
  * @default false
  * @returns SecurePostgresqlDb
  */
  public multiAz(multiAz: boolean): SecurePostgresqlDb {
    this._props.multiAz = multiAz;
    return this;
  }

  /**
  * Backup plan rule configuration.
  * https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_backup.BackupPlanRuleProps.html
  * @param backupPlanRuleProps
  * @default {
      completionWindow: Duration.hours(4),
      startWindow: Duration.hours(1),
      // Midnight, every night
      scheduleExpression: Schedule.cron({
        day: '*',
        hour: '0',
        minute: '0',
      }),
      deleteAfter: Duration.days(60),
    }
  * @returns SecurePostgresqlDb
  */
  public backupPlanRuleProps(backupPlanRuleProps: BackupPlanRuleProps): SecurePostgresqlDb {
    this._props.backupPlanRuleProps = backupPlanRuleProps;
    return this;
  }

  /**
  * Properties for configuring alarm thresholds.
  * @param minFreeMemoryMB - Minimum free memory threshold, in MB. Alarm triggers if value goes below threshold.
  * @param maxOpenConnections - Max open connections threshold. Alarm triggers if value goes above threshold.
  * @param freeStorageThresholdPct - Free storage percent threshold. Alarm triggers if value goes below threshold.
  * @default minFreeMemoryMB - 1024
  * @default maxOpenConnections - 100
  * @default freeStorageThresholdPct - 20
  * @returns SecurePostgresqlDb
  */
  public alarmProps(minFreeMemoryMB: number, maxOpenConnections: number, freeStorageThresholdPct: number): SecurePostgresqlDb {
    this._props.alarmProps = { minFreeMemoryMB, maxOpenConnections, freeStorageThresholdPct };
    return this;
  }

  /**
  * The Database will be created using the provided snapshot.
  * @param snapshotArn
  * @returns SecurePostgresqlDb
  */
  public snapshotArn(snapshotArn: string): SecurePostgresqlDb {
    this._props.snapshotArn = snapshotArn;
    return this;
  }

  /**
  * Allows the supplied security group access to the database on the configured port.
  * @param securityGroup
  * @returns SecurePostgresqlDb
  */
  public allowSgIngress(securityGroup: ISecurityGroup): SecurePostgresqlDb {
    this.securityGroup.addIngressRule(
      securityGroup,
      Port.tcp(this._props.port!),
      `CDK generated ingress. STACK - ${cdk.Stack.of(this)}`,
    );

    return this;
  }

  /**
  * Applies defaults that may be useful in a Production environment.
  * Should be called directly before .assemble()
  * @returns SecurePostgresqlDb
  */
  public applyProductionDefaults(): SecurePostgresqlDb {
    //this._props = Object.assign({}, this._productionDefaults, this._props);
    this._props = { ...this._props, ...this._productionDefaults };
    return this;
  }

  /**
  * Configures alarms to send notifications to the supplied SNS topic
  * @param topic - SNS topic to send alarms to
  * @returns SecurePostgresqlDb
  */
  public registerAlarms(topic: Topic): SecurePostgresqlDb {
    this.alarms.forEach((alarm) => {
      alarm.addAlarmAction(new SnsAction(topic));
      alarm.addOkAction(new SnsAction(topic));
    });

    return this;
  }

  private _createAlarms(): void {
    this.alarms.push(
      new Alarm(this, 'DbAlarmCpuUtilization', {
        comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        threshold: 90,
        evaluationPeriods: 2,
        metric: this.instance.metricCPUUtilization({
          statistic: 'avg',
          period: Duration.minutes(15),
        }),
      }),
    );

    this.alarms.push(
      new Alarm(this, 'DbAlarmMemoryUtilization', {
        comparisonOperator: ComparisonOperator.LESS_THAN_OR_EQUAL_TO_THRESHOLD,
        threshold: this._props.alarmProps?.minFreeMemoryMB!,
        evaluationPeriods: 2,
        metric: this.instance.metricFreeableMemory({
          statistic: 'avg',
          period: Duration.minutes(15),
        }),
      }),
    );

    this.alarms.push(
      new Alarm(this, 'DbAlarmStorageSpace', {
        comparisonOperator: ComparisonOperator.LESS_THAN_THRESHOLD,
        threshold: this._props.maxAllocatedStorage! * (this._props.alarmProps?.freeStorageThresholdPct! / 100),
        evaluationPeriods: 2,
        metric: this.instance.metricFreeStorageSpace({
          statistic: 'avg',
          period: Duration.minutes(15),
        }),
      }),
    );

    this.alarms.push(
      new Alarm(this, 'DbAlarmOpenConnections', {
        comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
        threshold: this._props.alarmProps?.maxOpenConnections!,
        evaluationPeriods: 2,
        metric: this.instance.metricDatabaseConnections({
          statistic: 'avg',
          period: Duration.minutes(15),
        }),
      }),
    );
  }

  private _createBackupPlan() {
    this.backupPlan = new BackupPlan(this, 'DbBackupPlan');

    this.backupPlan.addRule(new BackupPlanRule(this._props.backupPlanRuleProps!));

    this.backupPlan.addSelection('Selection', {
      resources: [BackupResource.fromRdsDatabaseInstance(this.instance)],
    });
  }

  private _createDbInstance() {
    this.instance = new DatabaseInstance(this, 'DbInstance', {
      instanceIdentifier: this._props.instanceIdentifier ?? undefined,
      instanceType: this._props.instanceType,
      engine: DatabaseInstanceEngine.postgres({
        version: this._props.postgresEngineVersion!,
      }),
      multiAz: this._props.multiAz,
      port: this._props.port,
      vpc: this._vpc,
      vpcSubnets: { subnetType: SubnetType.PRIVATE_WITH_EGRESS },
      securityGroups: [
        this.securityGroup as ISecurityGroup,
      ].concat(this._props.additionalSecurityGroups!),
      allocatedStorage: this._props.allocatedStorage,
      maxAllocatedStorage: this._props.maxAllocatedStorage,
      cloudwatchLogsExports: ['postgresql', 'upgrade'],
      cloudwatchLogsRetention: this._props.cloudWatchLogRetention,
      credentials: Credentials.fromSecret(this.credentialSecret),
      parameterGroup: createRDSLogEnabledParamGroup(this, {
        postgresEngineVersion: this._props.postgresEngineVersion!,
      }),
      removalPolicy: RemovalPolicy.RETAIN,
      storageEncrypted: true,
      storageEncryptionKey: this.encryptionKey,
      backupRetention: Duration.days(7),
      ...this._props.overrideInstanceProps,
    });

    if (this._props.snapshotArn) {
      const cfnDbInstance = this.instance.node.defaultChild as CfnDBInstance;
      cfnDbInstance.addPropertyOverride('DbSnapshotIdentifier', this._props.snapshotArn);
    }
  }

  private _createEncryptionKey() {
    this.encryptionKey = new Key(this, 'DbKmsKey', {
      description: `CDK generated database encryption key. STACK - ${cdk.Stack.of(this)}`,
      enableKeyRotation: true,
    });
  }

  private _createSecret() {
    this.credentialSecret = new Secret(this, 'DbCredentialSecret', {
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'postgres' }),
        excludePunctuation: true,
        includeSpace: false,
        generateStringKey: 'password',
      },
    });
  }

  private _createSecurityGroup() {
    this.securityGroup = new SecurityGroup(this, 'DbSecurityGroup', { vpc: this._vpc });
  }

  private _suppressNagRules() {
    Utils.suppressNagRule(this.instance, 'AwsSolutions-RDS11', 'Ignore non default port(5432) usage requirement.');
    Utils.suppressNagRule(this.credentialSecret, 'AwsSolutions-SMG4', 'Ignore password automatic rotation.');
  }

  public assemble(): SecurePostgresqlDb {
    this._vpc = Vpc.fromLookup(this, 'DbVpc', { vpcId: this._props.vpcId });

    this._createEncryptionKey();
    this._createSecret();
    this._createSecurityGroup();
    this._createDbInstance();
    this._createBackupPlan();
    this._createAlarms();
    this._suppressNagRules();

    return this;
  }
}

function createRDSLogEnabledParamGroup(
  scope: IConstruct,
  props: {
    postgresEngineVersion: PostgresEngineVersion;
  },
): ParameterGroup {
  return new ParameterGroup(scope, 'RDSLogEnabledParamGroup', {
    engine: DatabaseInstanceEngine.postgres({
      version: props.postgresEngineVersion,
    }),
    description: 'Logging-enabled Postgres parameter group',
    parameters: {
      'shared_preload_libraries': 'pg_stat_statements,pgaudit',
      'pgaudit.log': 'ddl,role',
      'log_statement': 'none',
      'log_min_error_statement': 'fatal',
    },
  });
}
