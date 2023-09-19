import '@aws-cdk/assert/jest';
import { App, Stack } from 'aws-cdk-lib';
import { SimpleServerlessApplication } from '../../src';


describe('EMR Serverless Application Construct', () => {

  describe('Basic Serverless Application', () => {
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

    test('default application configuration', () => {

      // WHEN
      new SimpleServerlessApplication(mystack, 'emrApp')
        .name('MyDefaultEmrApp')
        .vpc('vpc-0c472b04d1b6482c4')
        .assemble();

      // THEN application is created
      expect(mystack).toHaveResourceLike('AWS::EMRServerless::Application', {
        Name: 'MyDefaultEmrApp',
        MaximumCapacity: {
          Cpu: '960vCPU',
          Disk: '30000gb',
          Memory: '7680gb',
        },
        ReleaseLabel: 'emr-6.12.0',
      });

      // AND creates a security group that allows only outbound connections from VPC
      expect(mystack).toHaveResourceLike('AWS::EC2::SecurityGroup', {
        SecurityGroupEgress: [
          {
            CidrIp: '0.0.0.0/0',
            Description: 'Allow all outbound traffic by default',
            IpProtocol: '-1',
          },
        ],
      });

      // AND ensure that Dashboard exists
      expect(mystack).toHaveResourceLike('AWS::CloudWatch::Dashboard');


    });

  });

});