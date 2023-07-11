import { App, Duration, Stack } from 'aws-cdk-lib';
import '@aws-cdk/assert/jest';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { InstanceClass, InstanceSize, InstanceType, SecurityGroup, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Schedule } from 'aws-cdk-lib/aws-events';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { PostgresEngineVersion } from 'aws-cdk-lib/aws-rds';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { SecurePostgresqlDb } from '../../src/secure-postgresql-db';


describe('SecurePostgresqlDb Construct', () => {
  let myapp: App;
  let mystack: Stack;

  beforeEach(() => {
    // GIVEN
    myapp = new App();
    mystack = new Stack(myapp, 'mystack', {
      env: {
        account: '111111111111',
        region: 'us-east-1',
      },
    });
  });

  describe('Basic instance', () => {
    const defaultInstanceProps = {
      AllocatedStorage: '50',
      BackupRetentionPeriod: 7,
      DBInstanceClass: 'db.t4g.small',
      DBParameterGroupName: Match.anyValue(),
      DBSubnetGroupName: Match.anyValue(),
      DeletionProtection: false,
      EnableCloudwatchLogsExports: ['postgresql', 'upgrade'],
      Engine: 'postgres',
      EngineVersion: '15.3',
      KmsKeyId: Match.anyValue(),
      VPCSecurityGroups: Match.arrayEquals([Match.anyValue()]),
    };

    test('default construct has expected resources', () => {
      // WHEN
      let db = new SecurePostgresqlDb(mystack, 'db', {
        vpcId: '000000',
        instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.SMALL),
      }).assemble();

      // THEN should have expected resources
      expect(db.encryptionKey).toBeDefined();
      expect(db.instance).toBeDefined();
      expect(db.credentialSecret).toBeDefined();
      expect(db.securityGroup).toBeDefined();
      expect(db.alarms).toBeDefined();

      const template = Template.fromStack(mystack);

      template.resourceCountIs('AWS::KMS::Key', 1);
      template.resourceCountIs('AWS::SecretsManager::Secret', 1);
      template.resourceCountIs('AWS::EC2::SecurityGroup', 1);
      template.resourceCountIs('AWS::RDS::DBParameterGroup', 1);
      template.resourceCountIs('AWS::RDS::DBSubnetGroup', 1);
      template.resourceCountIs('AWS::RDS::DBInstance', 1);
      template.resourceCountIs('AWS::CloudWatch::Alarm', 4);
      template.resourceCountIs('AWS::SSM::Parameter', 5);
    });

    test('props supplied - default instance has expected properties', () => {
      // WHEN
      new SecurePostgresqlDb(mystack, 'db', {
        vpcId: '000000',
        instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.SMALL),
      }).assemble();

      const template = Template.fromStack(mystack);

      // THEN defaults are applied
      template.hasResourceProperties('AWS::RDS::DBInstance', defaultInstanceProps);
    });

    test('no props supplied - default instance has expected properties', () => {
      // WHEN
      new SecurePostgresqlDb(mystack, 'db')
        .vpcId('000000')
        .instanceType(InstanceType.of(InstanceClass.T4G, InstanceSize.SMALL))
        .assemble();

      const template = Template.fromStack(mystack);

      // THEN defaults are applied
      template.hasResourceProperties('AWS::RDS::DBInstance', defaultInstanceProps);
    });
  });

  describe('Production instance', () => {
    const productionInstanceProps = {
      AllocatedStorage: '50',
      BackupRetentionPeriod: 7,
      DBInstanceClass: 'db.t4g.large',
      DBParameterGroupName: Match.anyValue(),
      DBSubnetGroupName: Match.anyValue(),
      DeletionProtection: true,
      EnableCloudwatchLogsExports: ['postgresql', 'upgrade'],
      Engine: 'postgres',
      EngineVersion: '15.3',
      KmsKeyId: Match.anyValue(),
      MultiAZ: true,
      VPCSecurityGroups: Match.arrayEquals([Match.anyValue()]),
    };

    test('props supplied - production instance has expected properties', () => {
      // WHEN
      new SecurePostgresqlDb(mystack, 'db', {
        vpcId: '000000',
        instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.LARGE),
      }).applyProductionDefaults().assemble();

      const template = Template.fromStack(mystack);

      // THEN production defaults are applied
      template.hasResourceProperties('AWS::RDS::DBInstance', productionInstanceProps);
    });

    test('no props supplied - production instance has expected properties', () => {
      // WHEN
      new SecurePostgresqlDb(mystack, 'db')
        .vpcId('000000')
        .instanceType(InstanceType.of(InstanceClass.T4G, InstanceSize.LARGE))
        .applyProductionDefaults()
        .assemble();

      const template = Template.fromStack(mystack);

      // THEN production defaults are applied
      template.hasResourceProperties('AWS::RDS::DBInstance', productionInstanceProps);
    });
  });

  describe('Individual properties', () => {
    test('CloudWatch Log Retention', () => {
      // WHEN
      new SecurePostgresqlDb(mystack, 'db')
        .vpcId('000000')
        .instanceType(InstanceType.of(InstanceClass.T4G, InstanceSize.LARGE))
        .cloudWatchLogRetention(RetentionDays.TWO_YEARS)
        .assemble();

      const template = Template.fromStack(mystack);

      // THEN
      template.hasResourceProperties('Custom::LogRetention', { RetentionInDays: 731 });
    });

    test('Engine Version', () => {
      // WHEN
      new SecurePostgresqlDb(mystack, 'db')
        .vpcId('000000')
        .instanceType(InstanceType.of(InstanceClass.T4G, InstanceSize.LARGE))
        .postgresEngineVersion(PostgresEngineVersion.VER_12_15)
        .assemble();

      const template = Template.fromStack(mystack);

      // THEN
      template.hasResourceProperties('AWS::RDS::DBInstance', { EngineVersion: '12.15' });
    });

    test('Instance Identifier', () => {
      // WHEN
      new SecurePostgresqlDb(mystack, 'db')
        .vpcId('000000')
        .instanceType(InstanceType.of(InstanceClass.T4G, InstanceSize.LARGE))
        .instanceIdentifier('my-db')
        .assemble();

      const template = Template.fromStack(mystack);

      // THEN
      template.hasResourceProperties('AWS::RDS::DBInstance', { DBInstanceIdentifier: 'my-db' });
      template.hasResourceProperties('AWS::KMS::Key', {
        Description: Match.stringLikeRegexp('.*for instance - my-db.*'),
      });
    });

    test('Port', () => {
      // WHEN
      new SecurePostgresqlDb(mystack, 'db')
        .vpcId('000000')
        .instanceType(InstanceType.of(InstanceClass.T4G, InstanceSize.LARGE))
        .port(9999)
        .assemble();

      const template = Template.fromStack(mystack);

      // THEN
      template.hasResourceProperties('AWS::RDS::DBInstance', { Port: '9999' });
    });

    test('Additional Instance Props', () => {
      // WHEN
      new SecurePostgresqlDb(mystack, 'db')
        .vpcId('000000')
        .instanceType(InstanceType.of(InstanceClass.T4G, InstanceSize.LARGE))
        .overrideInstanceProps({ allowMajorVersionUpgrade: true })
        .assemble();

      const template = Template.fromStack(mystack);

      // THEN
      template.hasResourceProperties('AWS::RDS::DBInstance', { AllowMajorVersionUpgrade: true });
    });

    test('Additional Security Groups', () => {
      // WHEN
      const sg = new SecurityGroup(mystack, 'mySg', { vpc: Vpc.fromLookup(mystack, 'vpc', {}) });
      new SecurePostgresqlDb(mystack, 'db')
        .vpcId('000000')
        .instanceType(InstanceType.of(InstanceClass.T4G, InstanceSize.LARGE))
        .additionalSecurityGroups([sg])
        .assemble();

      const template = Template.fromStack(mystack);

      // THEN two security groups should be present
      template.hasResourceProperties('AWS::RDS::DBInstance',
        { VPCSecurityGroups: Match.arrayEquals([Match.anyValue(), Match.anyValue()]) },
      );
    });

    test('Allocated Storage', () => {
      // WHEN
      new SecurePostgresqlDb(mystack, 'db')
        .vpcId('000000')
        .instanceType(InstanceType.of(InstanceClass.T4G, InstanceSize.LARGE))
        .allocatedStorage(999)
        .assemble();

      const template = Template.fromStack(mystack);

      // THEN
      template.hasResourceProperties('AWS::RDS::DBInstance', { AllocatedStorage: '999' });
    });

    test('Max Allocated Storage', () => {
      // WHEN
      new SecurePostgresqlDb(mystack, 'db')
        .vpcId('000000')
        .instanceType(InstanceType.of(InstanceClass.T4G, InstanceSize.LARGE))
        .maxAllocatedStorage(999)
        .assemble();

      const template = Template.fromStack(mystack);

      // THEN
      template.hasResourceProperties('AWS::RDS::DBInstance', { MaxAllocatedStorage: 999 });
    });

    test('MultiAZ', () => {
      // WHEN
      new SecurePostgresqlDb(mystack, 'db')
        .vpcId('000000')
        .instanceType(InstanceType.of(InstanceClass.T4G, InstanceSize.LARGE))
        .multiAz(true)
        .assemble();

      const template = Template.fromStack(mystack);

      // THEN
      template.hasResourceProperties('AWS::RDS::DBInstance', { MultiAZ: true });
    });

    test('Auto Snapshot Retention', () => {
      // WHEN
      new SecurePostgresqlDb(mystack, 'db')
        .vpcId('000000')
        .instanceType(InstanceType.of(InstanceClass.T4G, InstanceSize.LARGE))
        .autoSnapshotRetention(Duration.days(10))
        .assemble();

      const template = Template.fromStack(mystack);

      // THEN
      template.hasResourceProperties('AWS::RDS::DBInstance', { BackupRetentionPeriod: 10 });
    });

    test('Enable Backup Plan', () => {
      // WHEN
      const db = new SecurePostgresqlDb(mystack, 'db')
        .vpcId('000000')
        .instanceType(InstanceType.of(InstanceClass.T4G, InstanceSize.LARGE))
        .enableBackupPlan(true)
        .assemble();

      const template = Template.fromStack(mystack);

      // THEN
      expect(db.backupPlan).toBeDefined();
      template.resourceCountIs('AWS::Backup::BackupPlan', 1);
      template.resourceCountIs('AWS::Backup::BackupVault', 1);
      template.resourceCountIs('AWS::Backup::BackupSelection', 1);
    });

    test('Backup Plan Rule Props', () => {
      // WHEN
      new SecurePostgresqlDb(mystack, 'db')
        .vpcId('000000')
        .instanceType(InstanceType.of(InstanceClass.T4G, InstanceSize.LARGE))
        .enableBackupPlan(true)
        .backupPlanRuleProps({
          completionWindow: Duration.hours(1),
          startWindow: Duration.hours(2),
          scheduleExpression: Schedule.cron({ day: '*', hour: '1' }),
          deleteAfter: Duration.days(13),
        },
        )
        .assemble();

      const template = Template.fromStack(mystack);

      // THEN
      template.hasResourceProperties('AWS::Backup::BackupPlan', {
        BackupPlan: {
          BackupPlanRule: Match.arrayWith([
            {
              CompletionWindowMinutes: 60,
              Lifecycle: {
                DeleteAfterDays: 13,
              },
              RuleName: Match.anyValue(),
              ScheduleExpression: 'cron(* 1 * * ? *)',
              StartWindowMinutes: 120,
              TargetBackupVault: Match.anyValue(),
            },
          ]),
        },
      });
    });

    test('Alarm Props', () => {
      // WHEN
      new SecurePostgresqlDb(mystack, 'db')
        .vpcId('000000')
        .instanceType(InstanceType.of(InstanceClass.T4G, InstanceSize.LARGE))
        .allocatedStorage(100)
        .maxAllocatedStorage(100)
        .alarmProps({
          cpuUtilizationThresholdPct: 50,
          minFreeMemoryMB: 2000,
          maxOpenConnections: 25,
          freeStorageThresholdPct: 50,
        }).assemble();

      const template = Template.fromStack(mystack);

      // THEN
      template.hasResourceProperties('AWS::CloudWatch::Alarm', { MetricName: 'CPUUtilization', Threshold: 50 });
      template.hasResourceProperties('AWS::CloudWatch::Alarm', { MetricName: 'FreeableMemory', Threshold: 2000 });
      template.hasResourceProperties('AWS::CloudWatch::Alarm', { MetricName: 'DatabaseConnections', Threshold: 25 });
      template.hasResourceProperties('AWS::CloudWatch::Alarm', { MetricName: 'FreeStorageSpace', Threshold: 50 });
    });

    test('Snapshot ARN', () => {
      // WHEN
      new SecurePostgresqlDb(mystack, 'db')
        .vpcId('000000')
        .instanceType(InstanceType.of(InstanceClass.T4G, InstanceSize.LARGE))
        .restoreFromSnapshot('foo::bar')
        .assemble();

      const template = Template.fromStack(mystack);

      // THEN
      template.hasResourceProperties('AWS::RDS::DBInstance', { DbSnapshotIdentifier: 'foo::bar' });
    });
  });

  describe('Construct functions', () => {
    test('Register alarms', () => {
      // WHEN
      new SecurePostgresqlDb(mystack, 'db')
        .vpcId('000000')
        .instanceType(InstanceType.of(InstanceClass.T4G, InstanceSize.LARGE))
        .registerAlarms(new Topic(mystack, 'topic', {}))
        .assemble();

      const template = Template.fromStack(mystack);

      // THEN
      template.hasResourceProperties('AWS::CloudWatch::Alarm', {
        AlarmActions: Match.arrayWith([{ Ref: Match.anyValue() }]),
      });
    });

    test('Register alarms after assembled', () => {
      // WHEN
      const db = new SecurePostgresqlDb(mystack, 'db')
        .vpcId('000000')
        .instanceType(InstanceType.of(InstanceClass.T4G, InstanceSize.LARGE))
        .assemble();

      db.registerAlarms(new Topic(mystack, 'topic', {}));

      const template = Template.fromStack(mystack);

      // THEN
      template.hasResourceProperties('AWS::CloudWatch::Alarm', {
        AlarmActions: Match.arrayWith([{ Ref: Match.anyValue() }]),
      });
    });

    test('Tag instance', () => {
      // WHEN
      new SecurePostgresqlDb(mystack, 'db')
        .vpcId('000000')
        .instanceType(InstanceType.of(InstanceClass.T4G, InstanceSize.LARGE))
        .tag('foo', 'bar')
        .assemble();

      const template = Template.fromStack(mystack);

      // THEN
      template.hasResourceProperties('AWS::RDS::DBInstance', {
        Tags: Match.arrayWith([{ Key: 'foo', Value: 'bar' }]),
      });
    });

    test('Tag all', () => {
      // WHEN
      new SecurePostgresqlDb(mystack, 'db')
        .vpcId('000000')
        .instanceType(InstanceType.of(InstanceClass.T4G, InstanceSize.LARGE))
        .tagAll('foo', 'bar')
        .assemble();

      const template = Template.fromStack(mystack);

      const match = Match.arrayWith([{ Key: 'foo', Value: 'bar' }]);

      // THEN
      template.hasResourceProperties('AWS::KMS::Key', { Tags: match });
      template.hasResourceProperties('AWS::SecretsManager::Secret', { Tags: match });
      template.hasResourceProperties('AWS::EC2::SecurityGroup', { Tags: match });
      template.hasResourceProperties('AWS::RDS::DBParameterGroup', { Tags: match });
      template.hasResourceProperties('AWS::RDS::DBSubnetGroup', { Tags: match });
      template.hasResourceProperties('AWS::RDS::DBInstance', { Tags: match });
    });

    test('Add sg', () => {
      // WHEN
      const sg = new SecurityGroup(mystack, 'mySg', { vpc: Vpc.fromLookup(mystack, 'vpc', {}) });
      new SecurePostgresqlDb(mystack, 'db')
        .vpcId('000000')
        .instanceType(InstanceType.of(InstanceClass.T4G, InstanceSize.LARGE))
        .allowSgIngress(sg)
        .assemble();

      const template = Template.fromStack(mystack);

      // THEN
      template.hasResourceProperties('AWS::EC2::SecurityGroupIngress', {
        IpProtocol: 'tcp',
        ToPort: 5432,
        FromPort: 5432,
        SourceSecurityGroupId: Match.anyValue(),
      });
    });

    test('Add sg after assembly', () => {
      // WHEN
      const sg = new SecurityGroup(mystack, 'mySg', { vpc: Vpc.fromLookup(mystack, 'vpc', {}) });
      const db = new SecurePostgresqlDb(mystack, 'db')
        .vpcId('000000')
        .instanceType(InstanceType.of(InstanceClass.T4G, InstanceSize.LARGE))
        .assemble();

      db.allowSgIngress(sg);

      const template = Template.fromStack(mystack);

      // THEN
      template.hasResourceProperties('AWS::EC2::SecurityGroupIngress', {
        IpProtocol: 'tcp',
        ToPort: 5432,
        FromPort: 5432,
        SourceSecurityGroupId: Match.anyValue(),
      });
    });
  });
});
