import { SynthUtils } from '@aws-cdk/assert';
import { App, Aspects, Stack } from 'aws-cdk-lib';
import '@aws-cdk/assert/jest';
import { ComputeType, LinuxBuildImage } from 'aws-cdk-lib/aws-codebuild';
import { Schedule } from 'aws-cdk-lib/aws-events';
import { AwsSolutionsChecks } from 'cdk-nag';
import { GitEvent, SimpleCodebuildProject } from '../../src';


describe('SimpleCodebuildProject Construct', () => {

  describe('GitEvent', () => {
    test('enum values', () => {
      expect(GitEvent.ALL).toEqual('all');
      expect(GitEvent.PULL_REQUEST).toEqual('pull_request');
      expect(GitEvent.PUSH).toEqual('push');
      expect(GitEvent.PULL_REQUEST_MERGED).toEqual('pull_request_merged');
    });
  });


  describe('Basic Project', () => {
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

    test('default project', () => {
      // WHEN
      let p = new SimpleCodebuildProject(mystack, 'myproject')
        .projectName('myproject')
        .gitRepoUrl('https://github.cms.gov/qpp/qpp-integration-test-infrastructure-cdk.git')
        .gitBaseBranch('main')
        .assemble();

      // THEN should have a default project created
      expect(p.project).toBeDefined();
      expect(mystack).toHaveResourceLike('AWS::CodeBuild::Project', {
        Name: 'myproject',
        EncryptionKey: 'alias/aws/s3',
        Source: {
          ReportBuildStatus: true,
          Location: 'https://github.cms.gov/qpp/qpp-integration-test-infrastructure-cdk.git',
          Type: 'GITHUB_ENTERPRISE',
        },
        Cache: {
          Type: 'NO_CACHE',
        },
        Artifacts: {
          Type: 'S3',
          NamespaceType: 'BUILD_ID',
          Packaging: 'ZIP',
        },
        Environment: {
          ComputeType: 'BUILD_GENERAL1_MEDIUM',
          Image: 'aws/codebuild/standard:6.0',
        },
      });

      // THEN should contain a bucket with correct name
      expect(mystack).toHaveResourceLike('AWS::S3::Bucket', {
        BucketName: 'myproject-artifacts-111111111111-us-east-1',
        LifecycleConfiguration: {
          Rules: [
            {
              ExpirationInDays: 90,
            },
          ],
        },
      });

    });
    test('project PR build', () => {
      // WHEN
      new SimpleCodebuildProject(mystack, 'myproject')
        .projectName('myproject')
        .gitRepoUrl('https://github.cms.gov/qpp/qpp-integration-test-infrastructure-cdk.git')
        .gitBaseBranch('main')
        .triggerBuildOnGitEvent(GitEvent.PULL_REQUEST)
        .assemble();

      // THEN should have a default project created
      expect(mystack).toHaveResourceLike('AWS::CodeBuild::Project', {
        Name: 'myproject',
        Triggers: {
          Webhook: true,
          FilterGroups: [
            [
              {
                Pattern: 'PULL_REQUEST_CREATED, PULL_REQUEST_UPDATED, PULL_REQUEST_REOPENED',
                Type: 'EVENT',
              },
              {
                Pattern: 'refs/heads/main',
                Type: 'BASE_REF',
              },
            ],
          ],
        },

      });


    });
    test('project Triggers On build', () => {
      // WHEN
      new SimpleCodebuildProject(mystack, 'myproject')
        .projectName('myproject')
        .gitRepoUrl('https://github.cms.gov/qpp/qpp-integration-test-infrastructure-cdk.git')
        .gitBaseBranch('main')
        .triggerBuildOnGitEvent(GitEvent.PULL_REQUEST)
        .triggerOnPushToBranches(['main', 'develop'])
        .assemble();

      // THEN should have a default project created
      expect(mystack).toHaveResourceLike('AWS::CodeBuild::Project', {
        Name: 'myproject',
        Triggers: {
          Webhook: true,
          FilterGroups: [
            [
              {
                Pattern: 'PULL_REQUEST_CREATED, PULL_REQUEST_UPDATED, PULL_REQUEST_REOPENED',
                Type: 'EVENT',
              },
              {
                Pattern: 'refs/heads/main',
                Type: 'BASE_REF',
              },
            ],
            [
              {
                Pattern: 'PUSH',
                Type: 'EVENT',
              },
              {
                Pattern: 'main',
                Type: 'HEAD_REF',
              },
            ], [
              {
                Pattern: 'PUSH',
                Type: 'EVENT',
              },
              {
                Pattern: 'develop',
                Type: 'HEAD_REF',
              },
            ],
          ],
        },

      });

    });

    test('project PR merged build', () => {
      // WHEN
      new SimpleCodebuildProject(mystack, 'myproject')
        .projectName('myproject')
        .gitRepoUrl('https://github.cms.gov/qpp/qpp-integration-test-infrastructure-cdk.git')
        .gitBaseBranch('main')
        .triggerBuildOnGitEvent(GitEvent.PULL_REQUEST_MERGED)
        .assemble();

      // THEN should have a default project created
      expect(mystack).toHaveResourceLike('AWS::CodeBuild::Project', {
        Name: 'myproject',
        Triggers: {
          Webhook: true,
          FilterGroups: [
            [
              {
                Pattern: 'PULL_REQUEST_MERGED',
                Type: 'EVENT',
              },
              {
                Pattern: 'refs/heads/main',
                Type: 'BASE_REF',
              },
            ],
          ],
        },

      });
    });
    test('project Scheduled build', () => {
      // WHEN
      new SimpleCodebuildProject(mystack, 'myproject')
        .projectName('myproject')
        .gitRepoUrl('https://github.cms.gov/qpp/qpp-integration-test-infrastructure-cdk.git')
        .gitBaseBranch('main')
        .triggerBuildOnSchedule(Schedule.cron({
          minute: '0',
          hour: '10',
        }))
        .assemble();

      expect(mystack).toHaveResourceLike('AWS::Events::Rule', {
        ScheduleExpression: 'cron(0 10 * * ? *)',
        State: 'ENABLED',
      });

    });

    test('project custom build image', () => {
      new SimpleCodebuildProject(mystack, 'myproject')
        .projectName('myproject')
        .gitRepoUrl('https://github.cms.gov/qpp/qpp-integration-test-infrastructure-cdk.git')
        .gitBaseBranch('main')
        .privileged(true)
        .computeType(ComputeType.LARGE)
        .ecrBuildImage('codebuild/images', 'latest')
        .assemble();


      expect(mystack).toHaveResourceLike('AWS::CodeBuild::Project', {
        Environment: {
          ComputeType: 'BUILD_GENERAL1_LARGE',
          Image: {
          },
        },
      });

    });

    test('project environment privileged mode simple way', () => {
      // WHEN
      new SimpleCodebuildProject(mystack, 'myproject')
        .projectName('myproject')
        .gitRepoUrl('https://github.cms.gov/qpp/qpp-integration-test-infrastructure-cdk.git')
        .gitBaseBranch('main')
        .privileged(true)
        .assemble();

      expect(mystack).toHaveResourceLike('AWS::CodeBuild::Project', {
        Environment: {
          PrivilegedMode: true,
        },
      });

    });

    test('project without artifacts', () => {
      // WHEN
      let p = new SimpleCodebuildProject(mystack, 'myproject')
        .projectName('myproject')
        .gitRepoUrl('https://github.cms.gov/qpp/qpp-integration-test-infrastructure-cdk.git')
        .gitBaseBranch('main')
        .skipArtifacts(true)
        .assemble();

      // THEN should have a default project created
      expect(p.project).toBeDefined();
      expect(mystack).toHaveResourceLike('AWS::CodeBuild::Project', {
        Artifacts: {
          Type: 'NO_ARTIFACTS',
        },
      });

      // THEN should contain a bucket with correct name
      expect(mystack).not.toHaveResourceLike('AWS::S3::Bucket', {
        BucketName: 'myproject-artifacts-111111111111-us-east-1',
      });

    });

    test('project environment privileged mode via overrides', () => {
      // WHEN
      new SimpleCodebuildProject(mystack, 'myproject')
        .projectName('myproject')
        .gitRepoUrl('https://github.cms.gov/qpp/qpp-integration-test-infrastructure-cdk.git')
        .gitBaseBranch('main')
        .assemble({
          environment: {
            buildImage: LinuxBuildImage.STANDARD_6_0, // updated to Amazon Linux 6.0
            privileged: true,
            computeType: ComputeType.MEDIUM,
            environmentVariables: {
              TIER: { value: 'QA' },
              CYPRESS_REPORTS: { value: true },
            },
          },
        });


      expect(mystack).toHaveResourceLike('AWS::CodeBuild::Project', {
        Environment: {
          PrivilegedMode: true,
        },
      });

    });
  });


  describe('Nagging Rules', () => {
    test('should not have nag errors', () => {
      // GIVEN
      const myapp = new App();
      const mystack = new Stack(myapp, 'mystack', {
        env: {
          account: '111111111111',
          region: 'us-east-1',
        },
      });
      // WHEN
      new SimpleCodebuildProject(mystack, 'myproject')
        .projectName('myproject')
        .gitRepoUrl('https://github.cms.gov/qpp/qpp-integration-test-infrastructure-cdk.git')
        .gitBaseBranch('main')
        .assemble();

      // THEN should not have any errors

      Aspects.of(mystack).add(new AwsSolutionsChecks());

      // THEN
      const messages = SynthUtils.synthesize(mystack).messages;
      expect(messages.length).toEqual(0);

    });
  });
});

