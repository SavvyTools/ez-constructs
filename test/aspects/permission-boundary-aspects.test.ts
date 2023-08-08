import { App, Aspects, RemovalPolicy, Stack } from 'aws-cdk-lib';
import '@aws-cdk/assert/jest';
import { PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { SecureBucket } from '../../lib';
import { PermissionsBoundaryAspect } from '../../src/aspects/permission-boundary-aspect';

export class MyStack extends Stack {

  constructor(scope: Construct, id: string) {
    super(scope, id, { env: { account: '111111111111', region: 'us-east-1' } });

    const role = new Role(this, 'MyRole', {
      roleName: 'biju-test-role',
      assumedBy: new ServicePrincipal('sns.amazonaws.com'),
    });

    role.addToPolicy(new PolicyStatement({
      resources: ['*'],
      actions: ['lambda:InvokeFunction'],
    }));

    new SecureBucket(this, 'myBucket')
      .bucketName('myworld')
      .overrideBucketProperties({
        autoDeleteObjects: true,
        removalPolicy: RemovalPolicy.DESTROY,
      })
      .assemble();

  }
}

describe('PermissionBoundaryAspect', () => {

  test('Aspect will apply the correct path and boundary', () => {
    const app = new App();
    const mystack = new MyStack(app, 'MyConstruct');
    Aspects.of(app).add(new PermissionsBoundaryAspect('/role/dev/', 'boundary/dev'));
    app.synth();
    expect(mystack).toHaveResourceLike('AWS::IAM::Role', {
      Path: '/role/dev/',
      PermissionsBoundary: 'arn:aws:iam::111111111111:policy/boundary/dev',
    });

  });

});