import { App, Stack } from 'aws-cdk-lib';
// import { inspect } from 'util';
import '@aws-cdk/assert/jest';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { InstanceClass, InstanceSize, InstanceType } from 'aws-cdk-lib/aws-ec2';
import { SecurePostgresqlDb } from '../../src/secure-postgresql-db';


describe('SecurePostgresqlDb Construct', () => {

  describe('Basic instance', () => {
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

    test('default construct has expected resources', () => {
      // WHEN
      const db = new SecurePostgresqlDb(mystack, 'db', {
        vpcId: '000000',
        instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.SMALL),
      });

      // THEN should have expected resources
      expect(db.encryptionKey).toBeDefined();
      expect(db.instance).toBeDefined();
      expect(db.credentialSecret).toBeDefined();
      expect(db.securityGroup).toBeDefined();
      expect(db.backupPlan).toBeDefined();
      expect(db.alarms).toBeDefined();

      const template = Template.fromStack(mystack);
      //   console.log(JSON.stringify(template.toJSON()));
      template.resourceCountIs('AWS::KMS::Key', 1);
      template.resourceCountIs('AWS::SecretsManager::Secret', 1);
      template.resourceCountIs('AWS::EC2::SecurityGroup', 1);
      template.resourceCountIs('AWS::RDS::DBParameterGroup', 1);
      template.resourceCountIs('AWS::RDS::DBSubnetGroup', 1);
      template.resourceCountIs('AWS::RDS::DBInstance', 1);
      template.resourceCountIs('AWS::Backup::BackupPlan', 1);
      template.resourceCountIs('AWS::Backup::BackupVault', 1);
      template.resourceCountIs('AWS::Backup::BackupSelection', 1);
      template.resourceCountIs('AWS::CloudWatch::Alarm', 4);
    });

    test('default instance has expected properties', () => {
      // WHEN
      new SecurePostgresqlDb(mystack, 'db', {
        vpcId: '000000',
        instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.SMALL),
      });

      const template = Template.fromStack(mystack);

      template.hasResourceProperties('AWS::RDS::DBInstance', {
        AllocatedStorage: '100',
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
      });
    });
  });
});
