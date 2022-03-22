import { App, Aspects, Stack } from 'aws-cdk-lib';
import '@aws-cdk/assert/jest';
import { Schedule } from 'aws-cdk-lib/aws-events';
import { AwsSolutionsChecks } from 'cdk-nag';
import { GitEvent, SimpleCodebuildProject } from '../../src';
import { SynthUtils } from '@aws-cdk/assert';

describe('SimpleCodebuildProject Construct', () => {

  describe('GitEvent', () => {
    test('enum values', () => {
      expect(GitEvent.ALL).toEqual('all');
      expect(GitEvent.PULL_REQUEST).toEqual('pull_request');
      expect(GitEvent.PUSH).toEqual('push');
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
          Image: 'aws/codebuild/standard:5.0',
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
  });


  describe('Nagging Rules', () => {
    test('should not have nag errors', () => {
      // GIVEN
      const myapp = new App();
      const mystack = new Stack(myapp, 'mystack', { env: { account: '111111111111', region: 'us-east-1' } });
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