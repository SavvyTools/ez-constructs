import { SynthUtils } from '@aws-cdk/assert';
import '@aws-cdk/assert/jest';
import { App, Aspects, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { AwsSolutionsChecks } from 'cdk-nag';
import { SecureBucket } from '../../src';

describe('SecureBucket Construct', () => {

  describe('Secure S3 Bucket', () => {
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

    test('default bucket parameters', () => {

      // WHEN
      new SecureBucket(mystack, 'secureBucket').bucketName('mybucket').assemble();

      // THEN should have correct name
      expect(mystack).toHaveResourceLike('AWS::S3::Bucket', {
        BucketName: 'mybucket-111111111111-us-east-1',
        LifecycleConfiguration: {
          Rules: [
            {
              ExpirationInDays: 3650,
            },
          ],
        },
      });


      // AND proper transitions to Infrequent IA and Intelligent tiering present
      expect(mystack).toHaveResourceLike('AWS::S3::Bucket', {
        BucketName: 'mybucket-111111111111-us-east-1',
        LifecycleConfiguration: {
          Rules: [
            {
              Transitions: [
                {
                  StorageClass: 'INTELLIGENT_TIERING',
                  TransitionInDays: 30,
                },
              ],
            },
          ],
        },
      });


      // AND that is encrypted
      expect(mystack).toHaveResourceLike('AWS::S3::Bucket', {
        BucketEncryption: {
          ServerSideEncryptionConfiguration: [
            {
              ServerSideEncryptionByDefault: {
                SSEAlgorithm: 'AES256',
              },
            },
          ],
        },
      });

      // AND ssl transport enforced
      expect(mystack).toHaveResourceLike('AWS::S3::BucketPolicy', {
        PolicyDocument: {
          Statement: [
            {},
          ],
        },
      });

      // AND that is blocked from public access
      expect(mystack).toHaveResourceLike('AWS::S3::Bucket', {
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: true,
          BlockPublicPolicy: true,
          IgnorePublicAcls: true,
          RestrictPublicBuckets: true,
        },
      });

      // AND versioned
      expect(mystack).toHaveResourceLike('AWS::S3::Bucket', {
        VersioningConfiguration: {
          Status: 'Enabled',
        },
      });
    });

    test('bucket version disabled', () => {
      // WHEN
      new SecureBucket(mystack, 'secureBucket')
        .bucketName('mybucket')
        .overrideBucketProperties({ versioned: false })
        .assemble();


      expect(mystack).not.toHaveResourceLike('AWS::S3::Bucket', {
        VersioningConfiguration: {
          Status: 'Enabled',
        },
      });
    });

  });

  describe('S3 Bucket Overrides', () => {
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

    test('bucket that override expiration', () => {
      // WHEN
      new SecureBucket(mystack, 'secureBucket')
        .bucketName('mybucket')
        .objectsExpireInDays(500)
        .moveToGlacierDeepArchive(true)
        .assemble();

      // THEN
      expect(mystack).toHaveResourceLike('AWS::S3::Bucket', {
        BucketName: 'mybucket-111111111111-us-east-1',
        LifecycleConfiguration: {
          Rules: [
            {
              ExpirationInDays: 500,
            },
          ],
        },
      });

      // AND proper transitions to Infrequent IA and Intelligent tiering should be present
      expect(mystack).toHaveResourceLike('AWS::S3::Bucket', {
        BucketName: 'mybucket-111111111111-us-east-1',
        LifecycleConfiguration: {
          Rules: [
            {
              Transitions: [
                {
                  StorageClass: 'DEEP_ARCHIVE',
                  TransitionInDays: 365,
                },
                {
                  StorageClass: 'INTELLIGENT_TIERING',
                  TransitionInDays: 30,
                },
              ],
            },
          ],
        },
      });
    });
    test('bucket that override expiration below 90 days', () => {
      // WHEN
      new SecureBucket(mystack, 'secureBucket')
        .bucketName('mybucket')
        .objectsExpireInDays(89)
        .assemble();

      // THEN no transition should be present
      expect(mystack).toHaveResourceLike('AWS::S3::Bucket', {
        BucketName: 'mybucket-111111111111-us-east-1',
        LifecycleConfiguration: {
          Rules: [
            {
              ExpirationInDays: 89,
              Transitions: [
                {
                  StorageClass: 'INTELLIGENT_TIERING',
                  TransitionInDays: 30,
                },
              ],
            },
          ],
        },
      });
    });
    test('bucket that override expiration below 60 days', () => {
      // WHEN
      new SecureBucket(mystack, 'secureBucket')
        .bucketName('mybucket')
        .objectsExpireInDays(59)
        .assemble();

      // THEN has the correct object expiration added
      expect(mystack).toHaveResourceLike('AWS::S3::Bucket', {
        LifecycleConfiguration: {
          Rules: [
            {
              ExpirationInDays: 59,
            },
          ],
        },

      });
      // AND no transition get added
      expect(mystack).not.toHaveResourceLike('AWS::S3::Bucket', {
        BucketName: 'mybucket-111111111111-us-east-1',
        LifecycleConfiguration: {
          Rules: [
            {
              Transitions: [
                {
                  StorageClass: 'STANDARD_IA',
                  TransitionInDays: 30,
                },
              ],
            },
          ],
        },
      });
    });

    test('bucket that bucket access can be restricted by from VPC', () => {
      // WHEN
      new SecureBucket(mystack, 'secureBucket')
        .bucketName('mybucket')
        .objectsExpireInDays(500)
        .overrideBucketProperties({ enforceSSL: false })
        .restrictAccessToVpcs(['vpc-123456'])
        .assemble();


      // THEN
      expect(mystack).toHaveResourceLike('AWS::S3::BucketPolicy', {
        PolicyDocument: {
          Statement: [
            {
              Action: 's3:*',
              Condition: {
                StringNotEquals: {
                  'aws:SourceVpce': [
                    'vpc-123456',
                  ],
                },
              },
              Effect: 'Deny',
              Principal: '*',
            },
          ],
        },
      });

    });

    test('bucket that bucket access can be restricted by from IP', () => {
      // WHEN
      new SecureBucket(mystack, 'secureBucket')
        .bucketName('mybucket')
        .objectsExpireInDays(500)
        .overrideBucketProperties({ enforceSSL: false })
        .restrictAccessToIpOrCidrs(['10.10.10.1/32'])
        .assemble();


      // THEN
      expect(mystack).toHaveResourceLike('AWS::S3::BucketPolicy', {
        PolicyDocument: {
          Statement: [
            {
              Action: 's3:*',
              Condition: {
                NotIpAddress: {
                  'aws:SourceIp': [
                    '10.10.10.1/32',
                  ],
                },
              },
              Effect: 'Deny',
              Principal: '*',
            },
          ],
        },
      });

    });

    test('bucket that is not SSL enabled', () => {
      // WHEN
      new SecureBucket(mystack, 'secureBucket')
        .bucketName('mybucket')
        .objectsExpireInDays(500)
        .overrideBucketProperties({ enforceSSL: false })
        .assemble();

      // THEN
      expect(mystack).not.toHaveResourceLike('AWS::S3::BucketPolicy', {
        PolicyDocument: {
          Statement: [
            {},
          ],
        },
      });

    });
  });

  describe('Secure S3 Bucket :: Logging', () => {
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

    test('enabled', () => {

      // WHEN
      new SecureBucket(mystack, 'secureBucket').bucketName('mybucket')
        .accessLogsBucket(new Bucket(mystack, 'test', { bucketName: 'test' }))
        .assemble();

      // THEN should have correct name
      expect(mystack).toHaveResourceLike('AWS::S3::Bucket', {
        LoggingConfiguration: {
          DestinationBucketName: {},
          LogFilePrefix: 'mybucket/',
        },
      });

    });

    test('disabled', () => {
      // WHEN
      new SecureBucket(mystack, 'secureBucket')
        .bucketName('mybucket')
        .assemble();


      // THEN should have correct name
      expect(mystack).not.toHaveResourceLike('AWS::S3::Bucket', {
        LoggingConfiguration: {},
      });
    });

  });

  describe('Secure S3 Bucket :: Lifecycle', () => {
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

    test('enabled by default', () => {

      // WHEN
      new SecureBucket(mystack, 'secureBucket').bucketName('mybucket')
        .assemble();

      // THEN should have correct name
      expect(mystack).toHaveResourceLike('AWS::S3::Bucket', {
        BucketName: 'mybucket-111111111111-us-east-1',
        LifecycleConfiguration: {
          Rules: [
            {
              Status: 'Enabled',
              ExpirationInDays: 3650,
              NoncurrentVersionExpiration: {
                NoncurrentDays: 90,
              },
              NoncurrentVersionTransitions: [
                {
                  StorageClass: 'GLACIER_IR',
                  TransitionInDays: 3,
                },
              ],
            },
          ],
        },
      });

    });

    test('updates expriry on demand', () => {

      // WHEN
      new SecureBucket(mystack, 'secureBucket').bucketName('mybucket')
        .nonCurrentObjectsExpireInDays(30)
        .assemble();

      // THEN should have correct name
      expect(mystack).toHaveResourceLike('AWS::S3::Bucket', {
        BucketName: 'mybucket-111111111111-us-east-1',
        LifecycleConfiguration: {
          Rules: [
            {
              Status: 'Enabled',
              ExpirationInDays: 3650,
              NoncurrentVersionExpiration: {
                NoncurrentDays: 30,
              },
              NoncurrentVersionTransitions: [
                {
                  StorageClass: 'GLACIER_IR',
                  TransitionInDays: 3,
                },
              ],
            },
          ],
        },
      });

    });


  });

  describe('Secure S3 Bucket :: Restrictions', () => {
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

    test('restrict paths', () => {

      // WHEN
      new SecureBucket(mystack, 'secureBucket').bucketName('mybucket')
        .restrictWritesToPaths(['main/*', 'main_$folder$/*'])
        .assemble();

      // THEN should have correct name
      expect(mystack).toHaveResourceLike('AWS::S3::Bucket', {
        BucketName: 'mybucket-111111111111-us-east-1',
      });

      // AND the resource restriction
      let t = Template.fromStack(mystack);
      let policies = t.findResources('AWS::S3::BucketPolicy');
      let bucketPolicy = Object.values(policies)[0].Properties.PolicyDocument.Statement[1];
      expect(bucketPolicy.Action).toEqual('s3:PutObject');
      expect(bucketPolicy.Sid).toEqual('RestrictWrites');
      expect(bucketPolicy.Effect).toEqual('Deny');

    });


  });

  describe('S3 Bucket Nagging', () => {

    test('should not throw error for s3 bucket access log', () => {
      // GIVEN
      const myapp = new App();
      const mystack = new Stack(myapp, 'mystack', {
        env: {
          account: '123456789012',
          region: 'us-east-1',
        },
      });
      // WHEN
      new SecureBucket(mystack, 'secureBucket')
        .bucketName('mybucket')
        .objectsExpireInDays(500)
        .assemble();
      Aspects.of(mystack).add(new AwsSolutionsChecks());
      // THEN
      const messages = SynthUtils.synthesize(mystack).messages;
      expect(messages.length).toEqual(0);

    });
  });
});