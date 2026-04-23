# SimpleCodebuildProject 

**Motivation**

Most of the cases,a developer will use CodeBuild setup to perform simple CI tasks such as:
- Build and test your code on a PR
- Run a specific script based on a cron schedule.

Also, they might want:
- Artifacts like testcase reports to be available via Reports tab and/or S3.
- Logs to be available via CloudWatch Logs.

However, there can be additional organizational retention policies, for example retaining logs for a particular period of time.

With this construct, you can easily create a basic CodeBuild project with many opinated defaults that are compliant with FISMA and NIST.

## GitHub Authentication

### AWS CodeConnections (Recommended)

**AWS CodeConnections** (formerly AWS CodeStar Connections) is the **recommended standard** for GitHub authentication in CodeBuild. It provides secure, token-free integration with GitHub without requiring Personal Access Tokens (PATs).

#### Benefits:
- **No PAT management**: No need to create, rotate, or store GitHub tokens
- **Secure**: Leverages AWS IAM for authentication
- **Auditable**: All connections are tracked in CloudTrail
- **Better security posture**: Eliminates token exposure risks

#### Usage:

First, create a CodeConnection in the AWS Console:
1. Navigate to AWS CodeConnections (Developer Tools → Connections)
2. Create a new connection to GitHub
3. Complete the OAuth flow to authorize AWS
4. Copy the Connection ARN

Then use it in your construct:

```ts
import { ComputeType } from 'aws-cdk-lib/aws-codebuild';

let cb = new SimpleCodebuildProject(stack, 'MyProject')
        .projectName('myproject')
        .gitRepoUrl('https://github.com/myorg/myrepo.git')
        .gitBaseBranch('main')
        .codeConnectionArn('arn:aws:codeconnections:us-east-1:123456789012:connection/your-connection-id')
        .triggerBuildOnGitEvent(GitEvent.PULL_REQUEST)
        .buildSpecPath('buildspecs/my-pr-checker.yml')
        .computeType(ComputeType.LARGE)
        .assemble();
```

### GitHub PAT (Legacy)

For backward compatibility, the construct still supports GitHub Personal Access Tokens (PAT). However, **this method is deprecated** and should only be used during migration testing.

```ts
import { ComputeType } from 'aws-cdk-lib/aws-codebuild';

// Legacy approach - not recommended for new projects
let cb = new SimpleCodebuildProject(stack, 'MyProject')
        .projectName('myproject')
        .gitRepoUrl('https://github.com/bijujoseph/cloudbiolinux.git')
        .gitBaseBranch('main')
        .triggerBuildOnGitEvent(GitEvent.PULL_REQUEST)
        .buildSpecPath('buildspecs/my-pr-checker.yml')
        .computeType(ComputeType.LARGE)
        .assemble();
```

## Examples

### Basic Project with CodeConnections

Creates a project named `my-project`, with artifacts going to my-project-artifacts-<accountId>-<region>
and logs going to `/aws/codebuild/my-project` log group with a retention period of 90 days and 14 months respectively.

```ts
import { ComputeType } from 'aws-cdk-lib/aws-codebuild';

let cb = new SimpleCodebuildProject(stack, 'MyProject')
        .projectName('myproject')
        .gitRepoUrl('https://github.com/myorg/myrepo.git')
        .gitBaseBranch('main')
        .codeConnectionArn('arn:aws:codeconnections:us-east-1:123456789012:connection/abc123')
        .triggerBuildOnGitEvent(GitEvent.PULL_REQUEST)
        .buildSpecPath('buildspecs/my-pr-checker.yml')
        .computeType(ComputeType.LARGE)
        .assemble();
```
