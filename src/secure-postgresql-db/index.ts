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
  // The VPC in which to deploy resources
  vpcId: string;
  // The length (in days) logs should be kept in CloudWatch
  cloudWatchLogRetention?: RetentionDays;
  postgresEngineVersion?: PostgresEngineVersion;
  instanceIdentifier?: string | null;
  instanceType: InstanceType;
  port?: number;
  additionalInstanceProps?: { string: any } | {};
  additionalSecurityGroups?: ISecurityGroup[];
  allocatedStorage?: number;
  maxAllocatedStorage?: number;
  multiAz?: boolean;
  backupPlanRuleProps?: BackupPlanRuleProps;
  alarmProps?: {
    // Minimum free memory threshold for alarm
    minFreeMemoryMB?: number;
    // Max open connection threshold for alarm
    maxOpenConnections?: number;
    // Threshold percentage of free storage for alarm
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
    additionalInstanceProps: {},
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
    cloudWatchLogRetention: RetentionDays.ONE_YEAR,
    multiAz: true,
    backupPlanRuleProps: {
      deleteAfter: Duration.days(3650),
    },
  };

  constructor(scope: Construct, id: string, props: SecurePostgresqlDbProps, applyProductionDefaults: boolean = false) {
    super(scope, id);

    // merge passed options and defaults
    this._props = Object.assign({}, this._defaultProps, props);
    this._props = Object.assign({}, this._productionDefaults, this._props);

    this._vpc = Vpc.fromLookup(this, 'DbVpc', { vpcId: this._props.vpcId });
    this.alarms = [];

    this._createEncryptionKey();
    this._createSecret();
    this._createSecurityGroup();
    this._createDbInstance(applyProductionDefaults);
    this._createBackupPlan();
    this._createAlarms();
    this._suppressNagRules();
  }

  public allowSgIngress(securityGroup: ISecurityGroup) {
    this.securityGroup.addIngressRule(
      securityGroup,
      Port.tcp(this._props.port!),
      `CDK generated ingress. STACK - ${cdk.Stack.of(this)}`,
    );
  }

  public registerAlarms(topic: Topic): void {
    this.alarms.forEach((alarm) => {
      alarm.addAlarmAction(new SnsAction(topic));
      alarm.addOkAction(new SnsAction(topic));
    });
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

  private _createDbInstance(applyProductionDefaults: boolean) {
    this.instance = new DatabaseInstance(this, 'DbInstance', {
      instanceIdentifier: this._props.instanceIdentifier ?? undefined,
      instanceType: this._props.instanceType,
      engine: DatabaseInstanceEngine.postgres({
        version: this._props.postgresEngineVersion!,
      }),
      vpc: this._vpc,
      vpcSubnets: { subnetType: SubnetType.PRIVATE_WITH_EGRESS },
      securityGroups: [
        this.securityGroup as ISecurityGroup,
      ].concat(this._props.additionalSecurityGroups!),
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
      deletionProtection: applyProductionDefaults,
      ...this._props.additionalInstanceProps,
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
