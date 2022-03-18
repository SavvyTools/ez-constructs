import { App, Stack } from 'aws-cdk-lib';
import * as _ from 'lodash';
import { CustomSynthesizer } from '../../src/lib/custom-synthesizer';


describe('CustomSynthesizer', () => {
  test('should be able to create a custom synthesizer', () => {
    let synthesizer = new CustomSynthesizer('myorg/rolepath');
    expect(synthesizer).toBeTruthy();
  });
  test('should be able to see the correct role paths', () => {
    // GIVEN
    const myapp = new App();

    // WHEN
    new Stack(myapp, 'mystack', {
      synthesizer: new CustomSynthesizer('myorg/rolepath'),
      env: { account: '111111111111', region: 'us-east-1' },
    });

    let assembly = myapp.synth();

    // THEN
    let cfArtifact = assembly.artifacts.find(a => a.id == 'mystack') || {};
    expect(_.get(cfArtifact, 'assumeRoleArn'))
      .toEqual('arn:${AWS::Partition}:iam::111111111111:role/myorg/rolepath/cdk-hnb659fds-deploy-role-111111111111-us-east-1');
    expect(_.get(cfArtifact, 'cloudFormationExecutionRoleArn'))
      .toEqual('arn:${AWS::Partition}:iam::111111111111:role/myorg/rolepath/cdk-hnb659fds-cfn-exec-role-111111111111-us-east-1');
  });
  test('should be able to see the correct role paths when roles already have slash prefix', () => {
    // GIVEN
    const myapp = new App();

    // WHEN
    new Stack(myapp, 'mystack', {
      synthesizer: new CustomSynthesizer('/myorg/rolepath'),
      env: { account: '111111111111', region: 'us-east-1' },
    });

    let assembly = myapp.synth();

    // THEN
    let cfArtifact = assembly.artifacts.find(a => a.id == 'mystack') || {};
    expect(_.get(cfArtifact, 'assumeRoleArn'))
      .toEqual('arn:${AWS::Partition}:iam::111111111111:role/myorg/rolepath/cdk-hnb659fds-deploy-role-111111111111-us-east-1');
    expect(_.get(cfArtifact, 'cloudFormationExecutionRoleArn'))
      .toEqual('arn:${AWS::Partition}:iam::111111111111:role/myorg/rolepath/cdk-hnb659fds-cfn-exec-role-111111111111-us-east-1');
  });
  test('should be able to see the correct role paths when roles already have slash suffix', () => {
    // GIVEN
    const myapp = new App();

    // WHEN
    new Stack(myapp, 'mystack', {
      synthesizer: new CustomSynthesizer('myorg/rolepath/'),
      env: { account: '111111111111', region: 'us-east-1' },
    });

    let assembly = myapp.synth();

    // THEN
    let cfArtifact = assembly.artifacts.find(a => a.id == 'mystack') || {};
    expect(_.get(cfArtifact, 'assumeRoleArn'))
      .toEqual('arn:${AWS::Partition}:iam::111111111111:role/myorg/rolepath/cdk-hnb659fds-deploy-role-111111111111-us-east-1');
    expect(_.get(cfArtifact, 'cloudFormationExecutionRoleArn'))
      .toEqual('arn:${AWS::Partition}:iam::111111111111:role/myorg/rolepath/cdk-hnb659fds-cfn-exec-role-111111111111-us-east-1');
  });
});