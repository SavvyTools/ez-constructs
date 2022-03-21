# SimpleCodebuildProject 

**Motivation**

Most of the cases,a developer will use CodeBuild setup to perform simple CI tasks such as:
- Build and test your code on a PR
- Run a specific script based on a cron schedule.

Also, they might want:
- Artifacts like testcase reports to be available via Reports tab and/or S3.
- Logs to be available via CloudWatch Logs.

However, there can be additional organizational retention policies, for example retaining logs for a particular period of time.

With this construct, you can easily create a basic CodeBuild project with many opinated defaults that are compliant with FISMA and NISTThis construct provides an easy way to create basic CodeBuild project with a lot of opinated defaults that are in compliance with FISMA and NIST.

Example, creates a project named `my-project`, with artifacts going to my-project-artifacts-<accountId>-<region>
 and logs going to `/aws/codebuild/my-project` log group with a retention period of 90 days and 14 months respectively.

```ts

new SimpleCodebuildProject(stack, 'MyProject')
   .projectName('myproject')
   .gitRepoUrl('https://github.com/bijujoseph/cloudbiolinux.git')
   .gitBaseBranch('main')
   .triggerEvent(GitEvent.PULL_REQUEST)
   .buildSpecPath('buildspecs/my-pr-checker.yml')
   .assemble();
```
