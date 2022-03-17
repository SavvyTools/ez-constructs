import { App, Stack } from 'aws-cdk-lib';
import { SecureBucket } from '../../src/secure-bucket';
import '@aws-cdk/assert/jest';

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
      new SecureBucket(mystack, 'secureBucket', {
        bucketName: 'mybucket',
      });

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
                  StorageClass: 'STANDARD_IA',
                  TransitionInDays: 30,
                },
                {
                  StorageClass: 'INTELLIGENT_TIERING',
                  TransitionInDays: 60,
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
      new SecureBucket(mystack, 'secureBucket', {
        bucketName: 'mybucket',
        versioned: false,
      });


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
      new SecureBucket(mystack, 'secureBucket', {
        bucketName: 'mybucket',
        objectsExpireInDays: 500,
      });

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
                  StorageClass: 'STANDARD_IA',
                  TransitionInDays: 30,
                },
                {
                  StorageClass: 'INTELLIGENT_TIERING',
                  TransitionInDays: 60,
                },
              ],
            },
          ],
        },
      });
    });
    test('bucket that override expiration below 90 days', () => {
      // WHEN
      new SecureBucket(mystack, 'secureBucket', {
        bucketName: 'mybucket',
        objectsExpireInDays: 89,
      });

      // THEN no transition should be present
      expect(mystack).toHaveResourceLike('AWS::S3::Bucket', {
        BucketName: 'mybucket-111111111111-us-east-1',
        LifecycleConfiguration: {
          Rules: [
            {
              ExpirationInDays: 89,
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
    test('bucket that override expiration below 60 days', () => {
      // WHEN
      new SecureBucket(mystack, 'secureBucket', {
        bucketName: 'mybucket',
        objectsExpireInDays: 59,
      });


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
    test('bucket that is not SSL enabled', () => {
      // WHEN
      new SecureBucket(mystack, 'secureBucket', {
        bucketName: 'mybucket',
        objectsExpireInDays: 500,
        enforceSSL: false,
      });

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
});