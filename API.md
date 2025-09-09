# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### EzConstruct <a name="EzConstruct" id="ez-constructs.EzConstruct"></a>

A marker base class for EzConstructs.

#### Initializers <a name="Initializers" id="ez-constructs.EzConstruct.Initializer"></a>

```typescript
import { EzConstruct } from 'ez-constructs'

new EzConstruct(scope: Construct, id: string)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#ez-constructs.EzConstruct.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#ez-constructs.EzConstruct.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="ez-constructs.EzConstruct.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="ez-constructs.EzConstruct.Initializer.parameter.id"></a>

- *Type:* string

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#ez-constructs.EzConstruct.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="ez-constructs.EzConstruct.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#ez-constructs.EzConstruct.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="ez-constructs.EzConstruct.isConstruct"></a>

```typescript
import { EzConstruct } from 'ez-constructs'

EzConstruct.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="ez-constructs.EzConstruct.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#ez-constructs.EzConstruct.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |

---

##### `node`<sup>Required</sup> <a name="node" id="ez-constructs.EzConstruct.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---


### SecureBucket <a name="SecureBucket" id="ez-constructs.SecureBucket"></a>

Will create a secure bucket with the following features: - Bucket name will be modified to include account and region.

Access limited to the owner
- Object Versioning
- Encryption at rest
- Object expiration max limit to 10 years
- Object will transition to IA after 60 days and later to deep archive after 365 days

Example:

```ts
   let aBucket = new SecureBucket(mystack, 'secureBucket', {
     bucketName: 'mybucket',
     objectsExpireInDays: 500,
     enforceSSL: false,
    });
```

#### Initializers <a name="Initializers" id="ez-constructs.SecureBucket.Initializer"></a>

```typescript
import { SecureBucket } from 'ez-constructs'

new SecureBucket(scope: Construct, id: string)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#ez-constructs.SecureBucket.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | - the stack in which the construct is defined. |
| <code><a href="#ez-constructs.SecureBucket.Initializer.parameter.id">id</a></code> | <code>string</code> | - a unique identifier for the construct. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="ez-constructs.SecureBucket.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

the stack in which the construct is defined.

---

##### `id`<sup>Required</sup> <a name="id" id="ez-constructs.SecureBucket.Initializer.parameter.id"></a>

- *Type:* string

a unique identifier for the construct.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#ez-constructs.SecureBucket.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#ez-constructs.SecureBucket.accessLogsBucket">accessLogsBucket</a></code> | Will enable the access logs to the given bucket. |
| <code><a href="#ez-constructs.SecureBucket.assemble">assemble</a></code> | Creates the underlying S3 bucket. |
| <code><a href="#ez-constructs.SecureBucket.bucketName">bucketName</a></code> | The name of the bucket. |
| <code><a href="#ez-constructs.SecureBucket.moveToGlacierDeepArchive">moveToGlacierDeepArchive</a></code> | Use only for buckets that have archiving data. |
| <code><a href="#ez-constructs.SecureBucket.moveToGlacierInstantRetrieval">moveToGlacierInstantRetrieval</a></code> | Use only for buckets that have archiving data. |
| <code><a href="#ez-constructs.SecureBucket.nonCurrentObjectsExpireInDays">nonCurrentObjectsExpireInDays</a></code> | The number of days that non current version of object will be kept. |
| <code><a href="#ez-constructs.SecureBucket.objectsExpireInDays">objectsExpireInDays</a></code> | The number of days that object will be kept. |
| <code><a href="#ez-constructs.SecureBucket.overrideBucketProperties">overrideBucketProperties</a></code> | This function allows users to override the defaults calculated by this construct and is only recommended for advanced usecases. |
| <code><a href="#ez-constructs.SecureBucket.restrictAccessToIpOrCidrs">restrictAccessToIpOrCidrs</a></code> | Adds access restrictions so that the access is allowed from the following IP ranges. |
| <code><a href="#ez-constructs.SecureBucket.restrictAccessToVpcs">restrictAccessToVpcs</a></code> | Adds access restrictions so that the access is allowed from the following VPCs. |
| <code><a href="#ez-constructs.SecureBucket.restrictWritesToPaths">restrictWritesToPaths</a></code> | Will only allow writes to the following path prefixes mentioned. |

---

##### `toString` <a name="toString" id="ez-constructs.SecureBucket.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `accessLogsBucket` <a name="accessLogsBucket" id="ez-constructs.SecureBucket.accessLogsBucket"></a>

```typescript
public accessLogsBucket(logsBucket: IBucket): SecureBucket
```

Will enable the access logs to the given bucket.

###### `logsBucket`<sup>Required</sup> <a name="logsBucket" id="ez-constructs.SecureBucket.accessLogsBucket.parameter.logsBucket"></a>

- *Type:* aws-cdk-lib.aws_s3.IBucket

---

##### `assemble` <a name="assemble" id="ez-constructs.SecureBucket.assemble"></a>

```typescript
public assemble(): SecureBucket
```

Creates the underlying S3 bucket.

##### `bucketName` <a name="bucketName" id="ez-constructs.SecureBucket.bucketName"></a>

```typescript
public bucketName(name: string): SecureBucket
```

The name of the bucket.

Internally the bucket name will be modified to include the account and region.

###### `name`<sup>Required</sup> <a name="name" id="ez-constructs.SecureBucket.bucketName.parameter.name"></a>

- *Type:* string

the name of the bucket to use.

---

##### `moveToGlacierDeepArchive` <a name="moveToGlacierDeepArchive" id="ez-constructs.SecureBucket.moveToGlacierDeepArchive"></a>

```typescript
public moveToGlacierDeepArchive(move?: boolean): SecureBucket
```

Use only for buckets that have archiving data.

CAUTION, once the object is archived, a temporary bucket copy is needed to restore the data.

###### `move`<sup>Optional</sup> <a name="move" id="ez-constructs.SecureBucket.moveToGlacierDeepArchive.parameter.move"></a>

- *Type:* boolean

---

##### `moveToGlacierInstantRetrieval` <a name="moveToGlacierInstantRetrieval" id="ez-constructs.SecureBucket.moveToGlacierInstantRetrieval"></a>

```typescript
public moveToGlacierInstantRetrieval(move?: boolean): SecureBucket
```

Use only for buckets that have archiving data.

###### `move`<sup>Optional</sup> <a name="move" id="ez-constructs.SecureBucket.moveToGlacierInstantRetrieval.parameter.move"></a>

- *Type:* boolean

---

##### `nonCurrentObjectsExpireInDays` <a name="nonCurrentObjectsExpireInDays" id="ez-constructs.SecureBucket.nonCurrentObjectsExpireInDays"></a>

```typescript
public nonCurrentObjectsExpireInDays(expiryInDays: number): SecureBucket
```

The number of days that non current version of object will be kept.

###### `expiryInDays`<sup>Required</sup> <a name="expiryInDays" id="ez-constructs.SecureBucket.nonCurrentObjectsExpireInDays.parameter.expiryInDays"></a>

- *Type:* number

---

##### `objectsExpireInDays` <a name="objectsExpireInDays" id="ez-constructs.SecureBucket.objectsExpireInDays"></a>

```typescript
public objectsExpireInDays(expiryInDays: number): SecureBucket
```

The number of days that object will be kept.

###### `expiryInDays`<sup>Required</sup> <a name="expiryInDays" id="ez-constructs.SecureBucket.objectsExpireInDays.parameter.expiryInDays"></a>

- *Type:* number

---

##### `overrideBucketProperties` <a name="overrideBucketProperties" id="ez-constructs.SecureBucket.overrideBucketProperties"></a>

```typescript
public overrideBucketProperties(props: BucketProps): SecureBucket
```

This function allows users to override the defaults calculated by this construct and is only recommended for advanced usecases.

The values supplied via props superseeds the defaults that are calculated.

###### `props`<sup>Required</sup> <a name="props" id="ez-constructs.SecureBucket.overrideBucketProperties.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_s3.BucketProps

The customized set of properties.

---

##### `restrictAccessToIpOrCidrs` <a name="restrictAccessToIpOrCidrs" id="ez-constructs.SecureBucket.restrictAccessToIpOrCidrs"></a>

```typescript
public restrictAccessToIpOrCidrs(ipsOrCidrs: string[]): SecureBucket
```

Adds access restrictions so that the access is allowed from the following IP ranges.

###### `ipsOrCidrs`<sup>Required</sup> <a name="ipsOrCidrs" id="ez-constructs.SecureBucket.restrictAccessToIpOrCidrs.parameter.ipsOrCidrs"></a>

- *Type:* string[]

---

##### `restrictAccessToVpcs` <a name="restrictAccessToVpcs" id="ez-constructs.SecureBucket.restrictAccessToVpcs"></a>

```typescript
public restrictAccessToVpcs(vpcIds: string[]): SecureBucket
```

Adds access restrictions so that the access is allowed from the following VPCs.

###### `vpcIds`<sup>Required</sup> <a name="vpcIds" id="ez-constructs.SecureBucket.restrictAccessToVpcs.parameter.vpcIds"></a>

- *Type:* string[]

---

##### `restrictWritesToPaths` <a name="restrictWritesToPaths" id="ez-constructs.SecureBucket.restrictWritesToPaths"></a>

```typescript
public restrictWritesToPaths(dirs: string[]): SecureBucket
```

Will only allow writes to the following path prefixes mentioned.

###### `dirs`<sup>Required</sup> <a name="dirs" id="ez-constructs.SecureBucket.restrictWritesToPaths.parameter.dirs"></a>

- *Type:* string[]

, a list of path prefixes to allow.

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#ez-constructs.SecureBucket.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="ez-constructs.SecureBucket.isConstruct"></a>

```typescript
import { SecureBucket } from 'ez-constructs'

SecureBucket.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="ez-constructs.SecureBucket.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#ez-constructs.SecureBucket.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#ez-constructs.SecureBucket.property.bucket">bucket</a></code> | <code>aws-cdk-lib.aws_s3.Bucket</code> | The underlying S3 bucket created by this construct. |

---

##### `node`<sup>Required</sup> <a name="node" id="ez-constructs.SecureBucket.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `bucket`<sup>Optional</sup> <a name="bucket" id="ez-constructs.SecureBucket.property.bucket"></a>

```typescript
public readonly bucket: Bucket;
```

- *Type:* aws-cdk-lib.aws_s3.Bucket

The underlying S3 bucket created by this construct.

---


### SimpleCodebuildProject <a name="SimpleCodebuildProject" id="ez-constructs.SimpleCodebuildProject"></a>

Most of the cases,a developer will use CodeBuild setup to perform simple CI tasks such as: - Build and test your code on a PR - Run a specific script based on a cron schedule.

Also, they might want:
- artifacts like testcase reports to be available via Reports UI and/or S3.
- logs to be available via CloudWatch Logs.

However, there can be additional organizational retention policies, for example retaining logs for a particular period of time.
With this construct, you can easily create a basic CodeBuild project with many opinated defaults that are compliant with FISMA and NIST.

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

#### Initializers <a name="Initializers" id="ez-constructs.SimpleCodebuildProject.Initializer"></a>

```typescript
import { SimpleCodebuildProject } from 'ez-constructs'

new SimpleCodebuildProject(scope: Construct, id: string)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#ez-constructs.SimpleCodebuildProject.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#ez-constructs.SimpleCodebuildProject.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="ez-constructs.SimpleCodebuildProject.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="ez-constructs.SimpleCodebuildProject.Initializer.parameter.id"></a>

- *Type:* string

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#ez-constructs.SimpleCodebuildProject.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#ez-constructs.SimpleCodebuildProject.addEnv">addEnv</a></code> | A convenient way to set the project environment variables. |
| <code><a href="#ez-constructs.SimpleCodebuildProject.artifactBucket">artifactBucket</a></code> | The name of the bucket to store the artifacts. |
| <code><a href="#ez-constructs.SimpleCodebuildProject.assemble">assemble</a></code> | *No description.* |
| <code><a href="#ez-constructs.SimpleCodebuildProject.buildImage">buildImage</a></code> | The build image to use. |
| <code><a href="#ez-constructs.SimpleCodebuildProject.buildSpecPath">buildSpecPath</a></code> | The build spec file path. |
| <code><a href="#ez-constructs.SimpleCodebuildProject.computeType">computeType</a></code> | The compute type to use. |
| <code><a href="#ez-constructs.SimpleCodebuildProject.ecrBuildImage">ecrBuildImage</a></code> | The build image to use. |
| <code><a href="#ez-constructs.SimpleCodebuildProject.filterByGithubUserIds">filterByGithubUserIds</a></code> | Filter webhook events by GitHub user IDs. |
| <code><a href="#ez-constructs.SimpleCodebuildProject.gitBaseBranch">gitBaseBranch</a></code> | The main branch of the github project. |
| <code><a href="#ez-constructs.SimpleCodebuildProject.gitRepoUrl">gitRepoUrl</a></code> | The github or enterprise github repository url. |
| <code><a href="#ez-constructs.SimpleCodebuildProject.inVpc">inVpc</a></code> | The vpc network interfaces to add to the codebuild. |
| <code><a href="#ez-constructs.SimpleCodebuildProject.overrideProjectProps">overrideProjectProps</a></code> | *No description.* |
| <code><a href="#ez-constructs.SimpleCodebuildProject.privileged">privileged</a></code> | Set privileged mode of execution. |
| <code><a href="#ez-constructs.SimpleCodebuildProject.projectDescription">projectDescription</a></code> | The description of the codebuild project. |
| <code><a href="#ez-constructs.SimpleCodebuildProject.projectName">projectName</a></code> | The name of the codebuild project. |
| <code><a href="#ez-constructs.SimpleCodebuildProject.skipArtifacts">skipArtifacts</a></code> | If set, will skip artifact creation. |
| <code><a href="#ez-constructs.SimpleCodebuildProject.triggerBuildOnGitEvent">triggerBuildOnGitEvent</a></code> | The Github events that can trigger this build. |
| <code><a href="#ez-constructs.SimpleCodebuildProject.triggerBuildOnSchedule">triggerBuildOnSchedule</a></code> | The cron schedule on which this build gets triggerd. |
| <code><a href="#ez-constructs.SimpleCodebuildProject.triggerOnPushToBranches">triggerOnPushToBranches</a></code> | Triggers build on push to specified branches. |

---

##### `toString` <a name="toString" id="ez-constructs.SimpleCodebuildProject.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `addEnv` <a name="addEnv" id="ez-constructs.SimpleCodebuildProject.addEnv"></a>

```typescript
public addEnv(name: string, envVar: BuildEnvironmentVariable): SimpleCodebuildProject
```

A convenient way to set the project environment variables.

The values set here will be presnted on the UI when build with overriding is used.

###### `name`<sup>Required</sup> <a name="name" id="ez-constructs.SimpleCodebuildProject.addEnv.parameter.name"></a>

- *Type:* string

The environment variable name.

---

###### `envVar`<sup>Required</sup> <a name="envVar" id="ez-constructs.SimpleCodebuildProject.addEnv.parameter.envVar"></a>

- *Type:* aws-cdk-lib.aws_codebuild.BuildEnvironmentVariable

The environment variable value Example:.

```ts
project
.addEnvironmentVariable('MY_ENV_VAR', {value: 'abcd})
.addEnvironmentVariable('MY_ENV_VAR', {value: '/dev/thatkey, type: BuildEnvironmentVariableType.PARAMETER_STORE})
.addEnvironmentVariable('MY_ENV_VAR', {value: 'arn:of:secret, type: BuildEnvironmentVariableType.SECRETS_MANAGER});
```

---

##### `artifactBucket` <a name="artifactBucket" id="ez-constructs.SimpleCodebuildProject.artifactBucket"></a>

```typescript
public artifactBucket(artifactBucket: string | IBucket): SimpleCodebuildProject
```

The name of the bucket to store the artifacts.

By default the buckets will get stored in `<project-name>-artifacts` bucket.
This function can be used to ovrride the default behavior.

###### `artifactBucket`<sup>Required</sup> <a name="artifactBucket" id="ez-constructs.SimpleCodebuildProject.artifactBucket.parameter.artifactBucket"></a>

- *Type:* string | aws-cdk-lib.aws_s3.IBucket

a valid existing Bucket reference or bucket name to use.

---

##### `assemble` <a name="assemble" id="ez-constructs.SimpleCodebuildProject.assemble"></a>

```typescript
public assemble(defaultProps?: ProjectProps): SimpleCodebuildProject
```

###### `defaultProps`<sup>Optional</sup> <a name="defaultProps" id="ez-constructs.SimpleCodebuildProject.assemble.parameter.defaultProps"></a>

- *Type:* aws-cdk-lib.aws_codebuild.ProjectProps

---

##### `buildImage` <a name="buildImage" id="ez-constructs.SimpleCodebuildProject.buildImage"></a>

```typescript
public buildImage(buildImage: IBuildImage): SimpleCodebuildProject
```

The build image to use.

> [https://docs.aws.amazon.com/cdk/api/v1/docs/@aws-cdk_aws-codebuild.IBuildImage.html](https://docs.aws.amazon.com/cdk/api/v1/docs/@aws-cdk_aws-codebuild.IBuildImage.html)

###### `buildImage`<sup>Required</sup> <a name="buildImage" id="ez-constructs.SimpleCodebuildProject.buildImage.parameter.buildImage"></a>

- *Type:* aws-cdk-lib.aws_codebuild.IBuildImage

---

##### `buildSpecPath` <a name="buildSpecPath" id="ez-constructs.SimpleCodebuildProject.buildSpecPath"></a>

```typescript
public buildSpecPath(buildSpecPath: string): SimpleCodebuildProject
```

The build spec file path.

###### `buildSpecPath`<sup>Required</sup> <a name="buildSpecPath" id="ez-constructs.SimpleCodebuildProject.buildSpecPath.parameter.buildSpecPath"></a>

- *Type:* string

relative location of the build spec file.

---

##### `computeType` <a name="computeType" id="ez-constructs.SimpleCodebuildProject.computeType"></a>

```typescript
public computeType(computeType: ComputeType): SimpleCodebuildProject
```

The compute type to use.

> [https://docs.aws.amazon.com/codebuild/latest/userguide/build-env-ref-compute-types.html](https://docs.aws.amazon.com/codebuild/latest/userguide/build-env-ref-compute-types.html)

###### `computeType`<sup>Required</sup> <a name="computeType" id="ez-constructs.SimpleCodebuildProject.computeType.parameter.computeType"></a>

- *Type:* aws-cdk-lib.aws_codebuild.ComputeType

---

##### `ecrBuildImage` <a name="ecrBuildImage" id="ez-constructs.SimpleCodebuildProject.ecrBuildImage"></a>

```typescript
public ecrBuildImage(ecrRepoName: string, imageTag: string): SimpleCodebuildProject
```

The build image to use.

###### `ecrRepoName`<sup>Required</sup> <a name="ecrRepoName" id="ez-constructs.SimpleCodebuildProject.ecrBuildImage.parameter.ecrRepoName"></a>

- *Type:* string

the ecr repository name.

---

###### `imageTag`<sup>Required</sup> <a name="imageTag" id="ez-constructs.SimpleCodebuildProject.ecrBuildImage.parameter.imageTag"></a>

- *Type:* string

the image tag.

---

##### `filterByGithubUserIds` <a name="filterByGithubUserIds" id="ez-constructs.SimpleCodebuildProject.filterByGithubUserIds"></a>

```typescript
public filterByGithubUserIds(userIds: number[]): SimpleCodebuildProject
```

Filter webhook events by GitHub user IDs.

###### `userIds`<sup>Required</sup> <a name="userIds" id="ez-constructs.SimpleCodebuildProject.filterByGithubUserIds.parameter.userIds"></a>

- *Type:* number[]

array of GitHub user IDs (not usernames, but id values).

---

##### `gitBaseBranch` <a name="gitBaseBranch" id="ez-constructs.SimpleCodebuildProject.gitBaseBranch"></a>

```typescript
public gitBaseBranch(branch: string): SimpleCodebuildProject
```

The main branch of the github project.

###### `branch`<sup>Required</sup> <a name="branch" id="ez-constructs.SimpleCodebuildProject.gitBaseBranch.parameter.branch"></a>

- *Type:* string

---

##### `gitRepoUrl` <a name="gitRepoUrl" id="ez-constructs.SimpleCodebuildProject.gitRepoUrl"></a>

```typescript
public gitRepoUrl(gitRepoUrl: string): SimpleCodebuildProject
```

The github or enterprise github repository url.

###### `gitRepoUrl`<sup>Required</sup> <a name="gitRepoUrl" id="ez-constructs.SimpleCodebuildProject.gitRepoUrl.parameter.gitRepoUrl"></a>

- *Type:* string

---

##### `inVpc` <a name="inVpc" id="ez-constructs.SimpleCodebuildProject.inVpc"></a>

```typescript
public inVpc(vpcId: string): SimpleCodebuildProject
```

The vpc network interfaces to add to the codebuild.

> [https://docs.aws.amazon.com/cdk/api/v1/docs/aws-codebuild-readme.html#definition-of-vpc-configuration-in-codebuild-project](https://docs.aws.amazon.com/cdk/api/v1/docs/aws-codebuild-readme.html#definition-of-vpc-configuration-in-codebuild-project)

###### `vpcId`<sup>Required</sup> <a name="vpcId" id="ez-constructs.SimpleCodebuildProject.inVpc.parameter.vpcId"></a>

- *Type:* string

---

##### `overrideProjectProps` <a name="overrideProjectProps" id="ez-constructs.SimpleCodebuildProject.overrideProjectProps"></a>

```typescript
public overrideProjectProps(props: ProjectProps): SimpleCodebuildProject
```

###### `props`<sup>Required</sup> <a name="props" id="ez-constructs.SimpleCodebuildProject.overrideProjectProps.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_codebuild.ProjectProps

---

##### `privileged` <a name="privileged" id="ez-constructs.SimpleCodebuildProject.privileged"></a>

```typescript
public privileged(p: boolean): SimpleCodebuildProject
```

Set privileged mode of execution.

Usually needed if this project builds Docker images,
and the build environment image you chose is not provided by CodeBuild with Docker support.
By default, Docker containers do not allow access to any devices.
Privileged mode grants a build project's Docker container access to all devices
https://docs.aws.amazon.com/codebuild/latest/userguide/change-project-console.html#change-project-console-environment

###### `p`<sup>Required</sup> <a name="p" id="ez-constructs.SimpleCodebuildProject.privileged.parameter.p"></a>

- *Type:* boolean

true/false.

---

##### `projectDescription` <a name="projectDescription" id="ez-constructs.SimpleCodebuildProject.projectDescription"></a>

```typescript
public projectDescription(projectDescription: string): SimpleCodebuildProject
```

The description of the codebuild project.

###### `projectDescription`<sup>Required</sup> <a name="projectDescription" id="ez-constructs.SimpleCodebuildProject.projectDescription.parameter.projectDescription"></a>

- *Type:* string

a valid description string.

---

##### `projectName` <a name="projectName" id="ez-constructs.SimpleCodebuildProject.projectName"></a>

```typescript
public projectName(projectName: string): SimpleCodebuildProject
```

The name of the codebuild project.

###### `projectName`<sup>Required</sup> <a name="projectName" id="ez-constructs.SimpleCodebuildProject.projectName.parameter.projectName"></a>

- *Type:* string

a valid name string.

---

##### `skipArtifacts` <a name="skipArtifacts" id="ez-constructs.SimpleCodebuildProject.skipArtifacts"></a>

```typescript
public skipArtifacts(skip: boolean): SimpleCodebuildProject
```

If set, will skip artifact creation.

###### `skip`<sup>Required</sup> <a name="skip" id="ez-constructs.SimpleCodebuildProject.skipArtifacts.parameter.skip"></a>

- *Type:* boolean

---

##### `triggerBuildOnGitEvent` <a name="triggerBuildOnGitEvent" id="ez-constructs.SimpleCodebuildProject.triggerBuildOnGitEvent"></a>

```typescript
public triggerBuildOnGitEvent(event: GitEvent): SimpleCodebuildProject
```

The Github events that can trigger this build.

###### `event`<sup>Required</sup> <a name="event" id="ez-constructs.SimpleCodebuildProject.triggerBuildOnGitEvent.parameter.event"></a>

- *Type:* <a href="#ez-constructs.GitEvent">GitEvent</a>

---

##### `triggerBuildOnSchedule` <a name="triggerBuildOnSchedule" id="ez-constructs.SimpleCodebuildProject.triggerBuildOnSchedule"></a>

```typescript
public triggerBuildOnSchedule(schedule: Schedule): SimpleCodebuildProject
```

The cron schedule on which this build gets triggerd.

###### `schedule`<sup>Required</sup> <a name="schedule" id="ez-constructs.SimpleCodebuildProject.triggerBuildOnSchedule.parameter.schedule"></a>

- *Type:* aws-cdk-lib.aws_events.Schedule

---

##### `triggerOnPushToBranches` <a name="triggerOnPushToBranches" id="ez-constructs.SimpleCodebuildProject.triggerOnPushToBranches"></a>

```typescript
public triggerOnPushToBranches(branches: string[]): SimpleCodebuildProject
```

Triggers build on push to specified branches.

###### `branches`<sup>Required</sup> <a name="branches" id="ez-constructs.SimpleCodebuildProject.triggerOnPushToBranches.parameter.branches"></a>

- *Type:* string[]

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#ez-constructs.SimpleCodebuildProject.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="ez-constructs.SimpleCodebuildProject.isConstruct"></a>

```typescript
import { SimpleCodebuildProject } from 'ez-constructs'

SimpleCodebuildProject.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="ez-constructs.SimpleCodebuildProject.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#ez-constructs.SimpleCodebuildProject.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#ez-constructs.SimpleCodebuildProject.property.project">project</a></code> | <code>aws-cdk-lib.aws_codebuild.Project</code> | The underlying codebuild project that is created by this construct. |

---

##### `node`<sup>Required</sup> <a name="node" id="ez-constructs.SimpleCodebuildProject.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `project`<sup>Optional</sup> <a name="project" id="ez-constructs.SimpleCodebuildProject.property.project"></a>

```typescript
public readonly project: Project;
```

- *Type:* aws-cdk-lib.aws_codebuild.Project

The underlying codebuild project that is created by this construct.

---


### SimpleServerlessApplication <a name="SimpleServerlessApplication" id="ez-constructs.SimpleServerlessApplication"></a>

#### Initializers <a name="Initializers" id="ez-constructs.SimpleServerlessApplication.Initializer"></a>

```typescript
import { SimpleServerlessApplication } from 'ez-constructs'

new SimpleServerlessApplication(scope: Construct, id: string)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#ez-constructs.SimpleServerlessApplication.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#ez-constructs.SimpleServerlessApplication.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="ez-constructs.SimpleServerlessApplication.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="ez-constructs.SimpleServerlessApplication.Initializer.parameter.id"></a>

- *Type:* string

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#ez-constructs.SimpleServerlessApplication.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#ez-constructs.SimpleServerlessApplication.assemble">assemble</a></code> | *No description.* |
| <code><a href="#ez-constructs.SimpleServerlessApplication.name">name</a></code> | *No description.* |
| <code><a href="#ez-constructs.SimpleServerlessApplication.skipDashboard">skipDashboard</a></code> | *No description.* |
| <code><a href="#ez-constructs.SimpleServerlessApplication.vpc">vpc</a></code> | *No description.* |

---

##### `toString` <a name="toString" id="ez-constructs.SimpleServerlessApplication.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `assemble` <a name="assemble" id="ez-constructs.SimpleServerlessApplication.assemble"></a>

```typescript
public assemble(props?: CfnApplicationProps): SimpleServerlessApplication
```

###### `props`<sup>Optional</sup> <a name="props" id="ez-constructs.SimpleServerlessApplication.assemble.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_emrserverless.CfnApplicationProps

---

##### `name` <a name="name" id="ez-constructs.SimpleServerlessApplication.name"></a>

```typescript
public name(name: string): SimpleServerlessApplication
```

###### `name`<sup>Required</sup> <a name="name" id="ez-constructs.SimpleServerlessApplication.name.parameter.name"></a>

- *Type:* string

---

##### `skipDashboard` <a name="skipDashboard" id="ez-constructs.SimpleServerlessApplication.skipDashboard"></a>

```typescript
public skipDashboard(skip: boolean): SimpleServerlessApplication
```

###### `skip`<sup>Required</sup> <a name="skip" id="ez-constructs.SimpleServerlessApplication.skipDashboard.parameter.skip"></a>

- *Type:* boolean

---

##### `vpc` <a name="vpc" id="ez-constructs.SimpleServerlessApplication.vpc"></a>

```typescript
public vpc(v: string | IVpc): SimpleServerlessApplication
```

###### `v`<sup>Required</sup> <a name="v" id="ez-constructs.SimpleServerlessApplication.vpc.parameter.v"></a>

- *Type:* string | aws-cdk-lib.aws_ec2.IVpc

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#ez-constructs.SimpleServerlessApplication.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="ez-constructs.SimpleServerlessApplication.isConstruct"></a>

```typescript
import { SimpleServerlessApplication } from 'ez-constructs'

SimpleServerlessApplication.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="ez-constructs.SimpleServerlessApplication.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#ez-constructs.SimpleServerlessApplication.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#ez-constructs.SimpleServerlessApplication.property.application">application</a></code> | <code>aws-cdk-lib.aws_emrserverless.CfnApplication</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="ez-constructs.SimpleServerlessApplication.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `application`<sup>Optional</sup> <a name="application" id="ez-constructs.SimpleServerlessApplication.property.application"></a>

```typescript
public readonly application: CfnApplication;
```

- *Type:* aws-cdk-lib.aws_emrserverless.CfnApplication

---


### SimpleServerlessSparkJob <a name="SimpleServerlessSparkJob" id="ez-constructs.SimpleServerlessSparkJob"></a>

This construct will create a Step function workflow that can submit spark job.

If you utilize the @see SandardSparkSubmitJobTemplate, the workflow generated will consist of a single spark job.
If you need a much elaborate workflow, you can provide a string version of the state definition, while initializing the construct.

> [StandardSparkSubmitJobTemplate. *  The `usingDefinition` method will take care of capturing variables, like `entryPoint`, `mainClass` etc .
By default the step function during execution utilize those variable values as default.
It is quite common that the JAR files used for the spark job may be different. To address that, 'EntryPoint` and `SparkSubmitParameters` variables are externalized and can be overriden during execution.
```typescript
new SimpleServerlessSparkJob(mystack, 'SingleFly', 'MyTestETL)
.jobRole('delegatedadmin/developer/blames-emr-serverless-job-role')
.applicationId('12345676')
.logBucket('mylogbucket-name')
.usingDefinition({
jobName: 'mytestjob',
entryPoint: 's3://aws-cms-amg-qpp-costscoring-artifact-dev-222224444433-us-east-1/biju_test_files/myspark-assembly.jar',
mainClass: 'serverless.SimpleSparkApp',
enableMonitoring: true,
})
.assemble();
```
Having seen the above simple example, let us look at a more elaborate example, where the step function workflow is complex.
It is possible to author the step function workflow JSON file and provide it as a string to the `usingDefinition` method.
```typescript
new SimpleServerlessSparkJob(mystackObj, 'MultiFly', 'MyAwesomeETL)
.jobRole('delegatedadmin/developer/blames-emr-serverless-job-role')
.applicationId('12345676')
.logBucket('mylogbucket-name')
.usingDefinition("{...json step function string.... }")
.assemble();
```
If we have to read differnent input parameters for the spark job, we can have variables that extract values from the context.
```typescript
new SimpleServerlessSparkJob(mystackObj, 'MultiFly')
.name('MyAwesomeETL')
.jobRole('delegatedadmin/developer/blames-emr-serverless-job-role')
.applicationId('12345676')
.logBucket('mylogbucket-name')
.usingDefinition("{...json step function string.... }")
.withDefaultInputs({"some":"thing", "other": "thing"})
.assemble();
```](StandardSparkSubmitJobTemplate. *  The `usingDefinition` method will take care of capturing variables, like `entryPoint`, `mainClass` etc .
By default the step function during execution utilize those variable values as default.
It is quite common that the JAR files used for the spark job may be different. To address that, 'EntryPoint` and `SparkSubmitParameters` variables are externalized and can be overriden during execution.
```typescript
new SimpleServerlessSparkJob(mystack, 'SingleFly', 'MyTestETL)
.jobRole('delegatedadmin/developer/blames-emr-serverless-job-role')
.applicationId('12345676')
.logBucket('mylogbucket-name')
.usingDefinition({
jobName: 'mytestjob',
entryPoint: 's3://aws-cms-amg-qpp-costscoring-artifact-dev-222224444433-us-east-1/biju_test_files/myspark-assembly.jar',
mainClass: 'serverless.SimpleSparkApp',
enableMonitoring: true,
})
.assemble();
```
Having seen the above simple example, let us look at a more elaborate example, where the step function workflow is complex.
It is possible to author the step function workflow JSON file and provide it as a string to the `usingDefinition` method.
```typescript
new SimpleServerlessSparkJob(mystackObj, 'MultiFly', 'MyAwesomeETL)
.jobRole('delegatedadmin/developer/blames-emr-serverless-job-role')
.applicationId('12345676')
.logBucket('mylogbucket-name')
.usingDefinition("{...json step function string.... }")
.assemble();
```
If we have to read differnent input parameters for the spark job, we can have variables that extract values from the context.
```typescript
new SimpleServerlessSparkJob(mystackObj, 'MultiFly')
.name('MyAwesomeETL')
.jobRole('delegatedadmin/developer/blames-emr-serverless-job-role')
.applicationId('12345676')
.logBucket('mylogbucket-name')
.usingDefinition("{...json step function string.... }")
.withDefaultInputs({"some":"thing", "other": "thing"})
.assemble();
```)

*Example*

```typescript
 There are many instances where an ETL job may only have a single spark job. In such cases, you can use the
```


#### Initializers <a name="Initializers" id="ez-constructs.SimpleServerlessSparkJob.Initializer"></a>

```typescript
import { SimpleServerlessSparkJob } from 'ez-constructs'

new SimpleServerlessSparkJob(scope: Construct, id: string, stepFunctionName: string)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#ez-constructs.SimpleServerlessSparkJob.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#ez-constructs.SimpleServerlessSparkJob.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#ez-constructs.SimpleServerlessSparkJob.Initializer.parameter.stepFunctionName">stepFunctionName</a></code> | <code>string</code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="ez-constructs.SimpleServerlessSparkJob.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="ez-constructs.SimpleServerlessSparkJob.Initializer.parameter.id"></a>

- *Type:* string

---

##### `stepFunctionName`<sup>Required</sup> <a name="stepFunctionName" id="ez-constructs.SimpleServerlessSparkJob.Initializer.parameter.stepFunctionName"></a>

- *Type:* string

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#ez-constructs.SimpleServerlessSparkJob.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#ez-constructs.SimpleServerlessSparkJob.addPolicy">addPolicy</a></code> | *No description.* |
| <code><a href="#ez-constructs.SimpleServerlessSparkJob.assemble">assemble</a></code> | Assembles the state machine. |
| <code><a href="#ez-constructs.SimpleServerlessSparkJob.createDefaultStateMachineProps">createDefaultStateMachineProps</a></code> | *No description.* |
| <code><a href="#ez-constructs.SimpleServerlessSparkJob.createStateMachine">createStateMachine</a></code> | Creates state machine from the given props. |
| <code><a href="#ez-constructs.SimpleServerlessSparkJob.createStateMachineCloudWatchLogGroup">createStateMachineCloudWatchLogGroup</a></code> | creates bucket to store state machine logs. |
| <code><a href="#ez-constructs.SimpleServerlessSparkJob.createStateMachineRole">createStateMachineRole</a></code> | creates state machine role. |
| <code><a href="#ez-constructs.SimpleServerlessSparkJob.generateDefaultStateMachinePermissions">generateDefaultStateMachinePermissions</a></code> | Will add default permisisons to the step function role. |
| <code><a href="#ez-constructs.SimpleServerlessSparkJob.grantPassRole">grantPassRole</a></code> | Grants pass role permissions to the state machine role. |
| <code><a href="#ez-constructs.SimpleServerlessSparkJob.logGroupName">logGroupName</a></code> | Sets the logGroupName. |
| <code><a href="#ez-constructs.SimpleServerlessSparkJob.modifyStateDefinition">modifyStateDefinition</a></code> | Modifies the supplied state definition string version of workflow defintion to include logging and tracing. |
| <code><a href="#ez-constructs.SimpleServerlessSparkJob.usingChainableDefinition">usingChainableDefinition</a></code> | *No description.* |
| <code><a href="#ez-constructs.SimpleServerlessSparkJob.usingStringDefinition">usingStringDefinition</a></code> | *No description.* |
| <code><a href="#ez-constructs.SimpleServerlessSparkJob.withDefaultInputs">withDefaultInputs</a></code> | Default inputs of the spark jobs. |
| <code><a href="#ez-constructs.SimpleServerlessSparkJob.applicationId">applicationId</a></code> | The serverless application ID, and to that application the jobs will be submitted. |
| <code><a href="#ez-constructs.SimpleServerlessSparkJob.jobRole">jobRole</a></code> | The role the spark job will assume while executing jobs in EMR. |
| <code><a href="#ez-constructs.SimpleServerlessSparkJob.logBucket">logBucket</a></code> | A bucket to store the logs producee by the Spark jobs. |
| <code><a href="#ez-constructs.SimpleServerlessSparkJob.usingSparkJobTemplate">usingSparkJobTemplate</a></code> | Will create a state definition object based on the supplied StandardSparkSubmitJobTemplate object. |

---

##### `toString` <a name="toString" id="ez-constructs.SimpleServerlessSparkJob.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `addPolicy` <a name="addPolicy" id="ez-constructs.SimpleServerlessSparkJob.addPolicy"></a>

```typescript
public addPolicy(policy: PolicyStatement): SimpleStepFunction
```

###### `policy`<sup>Required</sup> <a name="policy" id="ez-constructs.SimpleServerlessSparkJob.addPolicy.parameter.policy"></a>

- *Type:* aws-cdk-lib.aws_iam.PolicyStatement

---

##### `assemble` <a name="assemble" id="ez-constructs.SimpleServerlessSparkJob.assemble"></a>

```typescript
public assemble(stateMachineProps?: StateMachineProps): SimpleStepFunction
```

Assembles the state machine.

###### `stateMachineProps`<sup>Optional</sup> <a name="stateMachineProps" id="ez-constructs.SimpleServerlessSparkJob.assemble.parameter.stateMachineProps"></a>

- *Type:* aws-cdk-lib.aws_stepfunctions.StateMachineProps

---

##### `createDefaultStateMachineProps` <a name="createDefaultStateMachineProps" id="ez-constructs.SimpleServerlessSparkJob.createDefaultStateMachineProps"></a>

```typescript
public createDefaultStateMachineProps(stateMachineName: string, stateMachineRole: IRole, definitionBody: DefinitionBody, logGroup: ILogGroup): StateMachineProps
```

###### `stateMachineName`<sup>Required</sup> <a name="stateMachineName" id="ez-constructs.SimpleServerlessSparkJob.createDefaultStateMachineProps.parameter.stateMachineName"></a>

- *Type:* string

---

###### `stateMachineRole`<sup>Required</sup> <a name="stateMachineRole" id="ez-constructs.SimpleServerlessSparkJob.createDefaultStateMachineProps.parameter.stateMachineRole"></a>

- *Type:* aws-cdk-lib.aws_iam.IRole

---

###### `definitionBody`<sup>Required</sup> <a name="definitionBody" id="ez-constructs.SimpleServerlessSparkJob.createDefaultStateMachineProps.parameter.definitionBody"></a>

- *Type:* aws-cdk-lib.aws_stepfunctions.DefinitionBody

---

###### `logGroup`<sup>Required</sup> <a name="logGroup" id="ez-constructs.SimpleServerlessSparkJob.createDefaultStateMachineProps.parameter.logGroup"></a>

- *Type:* aws-cdk-lib.aws_logs.ILogGroup

---

##### `createStateMachine` <a name="createStateMachine" id="ez-constructs.SimpleServerlessSparkJob.createStateMachine"></a>

```typescript
public createStateMachine(stateMachineProps: StateMachineProps): StateMachine
```

Creates state machine from the given props.

###### `stateMachineProps`<sup>Required</sup> <a name="stateMachineProps" id="ez-constructs.SimpleServerlessSparkJob.createStateMachine.parameter.stateMachineProps"></a>

- *Type:* aws-cdk-lib.aws_stepfunctions.StateMachineProps

---

##### `createStateMachineCloudWatchLogGroup` <a name="createStateMachineCloudWatchLogGroup" id="ez-constructs.SimpleServerlessSparkJob.createStateMachineCloudWatchLogGroup"></a>

```typescript
public createStateMachineCloudWatchLogGroup(): ILogGroup
```

creates bucket to store state machine logs.

##### `createStateMachineRole` <a name="createStateMachineRole" id="ez-constructs.SimpleServerlessSparkJob.createStateMachineRole"></a>

```typescript
public createStateMachineRole(stateMachineName: string): IRole
```

creates state machine role.

###### `stateMachineName`<sup>Required</sup> <a name="stateMachineName" id="ez-constructs.SimpleServerlessSparkJob.createStateMachineRole.parameter.stateMachineName"></a>

- *Type:* string

---

##### `generateDefaultStateMachinePermissions` <a name="generateDefaultStateMachinePermissions" id="ez-constructs.SimpleServerlessSparkJob.generateDefaultStateMachinePermissions"></a>

```typescript
public generateDefaultStateMachinePermissions(): void
```

Will add default permisisons to the step function role.

##### `grantPassRole` <a name="grantPassRole" id="ez-constructs.SimpleServerlessSparkJob.grantPassRole"></a>

```typescript
public grantPassRole(role: IRole): SimpleStepFunction
```

Grants pass role permissions to the state machine role.

###### `role`<sup>Required</sup> <a name="role" id="ez-constructs.SimpleServerlessSparkJob.grantPassRole.parameter.role"></a>

- *Type:* aws-cdk-lib.aws_iam.IRole

---

##### `logGroupName` <a name="logGroupName" id="ez-constructs.SimpleServerlessSparkJob.logGroupName"></a>

```typescript
public logGroupName(value: string): SimpleStepFunction
```

Sets the logGroupName.

###### `value`<sup>Required</sup> <a name="value" id="ez-constructs.SimpleServerlessSparkJob.logGroupName.parameter.value"></a>

- *Type:* string

name of the log group.

---

##### `modifyStateDefinition` <a name="modifyStateDefinition" id="ez-constructs.SimpleServerlessSparkJob.modifyStateDefinition"></a>

```typescript
public modifyStateDefinition(aDef: string): string
```

Modifies the supplied state definition string version of workflow defintion to include logging and tracing.

###### `aDef`<sup>Required</sup> <a name="aDef" id="ez-constructs.SimpleServerlessSparkJob.modifyStateDefinition.parameter.aDef"></a>

- *Type:* string

the state definition string.

---

##### `usingChainableDefinition` <a name="usingChainableDefinition" id="ez-constructs.SimpleServerlessSparkJob.usingChainableDefinition"></a>

```typescript
public usingChainableDefinition(stateDefinition: IChainable): SimpleStepFunction
```

###### `stateDefinition`<sup>Required</sup> <a name="stateDefinition" id="ez-constructs.SimpleServerlessSparkJob.usingChainableDefinition.parameter.stateDefinition"></a>

- *Type:* aws-cdk-lib.aws_stepfunctions.IChainable

---

##### `usingStringDefinition` <a name="usingStringDefinition" id="ez-constructs.SimpleServerlessSparkJob.usingStringDefinition"></a>

```typescript
public usingStringDefinition(stateDefinition: string): SimpleStepFunction
```

###### `stateDefinition`<sup>Required</sup> <a name="stateDefinition" id="ez-constructs.SimpleServerlessSparkJob.usingStringDefinition.parameter.stateDefinition"></a>

- *Type:* string

---

##### `withDefaultInputs` <a name="withDefaultInputs" id="ez-constructs.SimpleServerlessSparkJob.withDefaultInputs"></a>

```typescript
public withDefaultInputs(params: any): SimpleStepFunction
```

Default inputs of the spark jobs.

Example:-
 ```
 .withDefaultInputs({
     "SparkSubmitParameters": {
       "--conf spark.executor.memory=2g",
       "--conf spark.executor.cores=2"
     },
     "greetings": "Good morning",
     "personal": {
       "name": "John Doe",
       "age": 30
     }
  })
 ```

###### `params`<sup>Required</sup> <a name="params" id="ez-constructs.SimpleServerlessSparkJob.withDefaultInputs.parameter.params"></a>

- *Type:* any

---

##### `applicationId` <a name="applicationId" id="ez-constructs.SimpleServerlessSparkJob.applicationId"></a>

```typescript
public applicationId(applicaitonId: string): SimpleServerlessSparkJob
```

The serverless application ID, and to that application the jobs will be submitted.

###### `applicaitonId`<sup>Required</sup> <a name="applicaitonId" id="ez-constructs.SimpleServerlessSparkJob.applicationId.parameter.applicaitonId"></a>

- *Type:* string

---

##### `jobRole` <a name="jobRole" id="ez-constructs.SimpleServerlessSparkJob.jobRole"></a>

```typescript
public jobRole(name: string): SimpleServerlessSparkJob
```

The role the spark job will assume while executing jobs in EMR.

###### `name`<sup>Required</sup> <a name="name" id="ez-constructs.SimpleServerlessSparkJob.jobRole.parameter.name"></a>

- *Type:* string

a qualified name including the path.

e.g. `path/to/roleName`

---

##### `logBucket` <a name="logBucket" id="ez-constructs.SimpleServerlessSparkJob.logBucket"></a>

```typescript
public logBucket(bucket: string | IBucket): SimpleServerlessSparkJob
```

A bucket to store the logs producee by the Spark jobs.

###### `bucket`<sup>Required</sup> <a name="bucket" id="ez-constructs.SimpleServerlessSparkJob.logBucket.parameter.bucket"></a>

- *Type:* string | aws-cdk-lib.aws_s3.IBucket

---

##### `usingSparkJobTemplate` <a name="usingSparkJobTemplate" id="ez-constructs.SimpleServerlessSparkJob.usingSparkJobTemplate"></a>

```typescript
public usingSparkJobTemplate(sparkJobTemplate: StandardSparkSubmitJobTemplate): SimpleServerlessSparkJob
```

Will create a state definition object based on the supplied StandardSparkSubmitJobTemplate object.

###### `sparkJobTemplate`<sup>Required</sup> <a name="sparkJobTemplate" id="ez-constructs.SimpleServerlessSparkJob.usingSparkJobTemplate.parameter.sparkJobTemplate"></a>

- *Type:* <a href="#ez-constructs.StandardSparkSubmitJobTemplate">StandardSparkSubmitJobTemplate</a>

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#ez-constructs.SimpleServerlessSparkJob.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="ez-constructs.SimpleServerlessSparkJob.isConstruct"></a>

```typescript
import { SimpleServerlessSparkJob } from 'ez-constructs'

SimpleServerlessSparkJob.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="ez-constructs.SimpleServerlessSparkJob.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#ez-constructs.SimpleServerlessSparkJob.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#ez-constructs.SimpleServerlessSparkJob.property.account">account</a></code> | <code>string</code> | *No description.* |
| <code><a href="#ez-constructs.SimpleServerlessSparkJob.property.defaultInputs">defaultInputs</a></code> | <code>any</code> | *No description.* |
| <code><a href="#ez-constructs.SimpleServerlessSparkJob.property.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#ez-constructs.SimpleServerlessSparkJob.property.policies">policies</a></code> | <code>aws-cdk-lib.aws_iam.PolicyStatement[]</code> | *No description.* |
| <code><a href="#ez-constructs.SimpleServerlessSparkJob.property.region">region</a></code> | <code>string</code> | *No description.* |
| <code><a href="#ez-constructs.SimpleServerlessSparkJob.property.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#ez-constructs.SimpleServerlessSparkJob.property.stateDefinitionAsString">stateDefinitionAsString</a></code> | <code>string</code> | Returns the state definition as a string if the original state definition used was string. |
| <code><a href="#ez-constructs.SimpleServerlessSparkJob.property.stateDefinitionBody">stateDefinitionBody</a></code> | <code>aws-cdk-lib.aws_stepfunctions.DefinitionBody</code> | Returns the state definition body object. |
| <code><a href="#ez-constructs.SimpleServerlessSparkJob.property.stateMachine">stateMachine</a></code> | <code>aws-cdk-lib.aws_stepfunctions.StateMachine</code> | The state machine instance created by this construct. |
| <code><a href="#ez-constructs.SimpleServerlessSparkJob.property.stateMachineRole">stateMachineRole</a></code> | <code>aws-cdk-lib.aws_iam.IRole</code> | *No description.* |
| <code><a href="#ez-constructs.SimpleServerlessSparkJob.property.stateDefinition">stateDefinition</a></code> | <code>string \| aws-cdk-lib.aws_stepfunctions.IChainable</code> | Sets the state definition, and if type of the value passed is a string, will also set the stateDefinition when it is a string. |
| <code><a href="#ez-constructs.SimpleServerlessSparkJob.property.replacerLambdaFn">replacerLambdaFn</a></code> | <code>aws-cdk-lib.aws_lambda.SingletonFunction</code> | *No description.* |
| <code><a href="#ez-constructs.SimpleServerlessSparkJob.property.validatorLambdaFn">validatorLambdaFn</a></code> | <code>aws-cdk-lib.aws_lambda.SingletonFunction</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="ez-constructs.SimpleServerlessSparkJob.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `account`<sup>Required</sup> <a name="account" id="ez-constructs.SimpleServerlessSparkJob.property.account"></a>

```typescript
public readonly account: string;
```

- *Type:* string

---

##### `defaultInputs`<sup>Required</sup> <a name="defaultInputs" id="ez-constructs.SimpleServerlessSparkJob.property.defaultInputs"></a>

```typescript
public readonly defaultInputs: any;
```

- *Type:* any

---

##### `id`<sup>Required</sup> <a name="id" id="ez-constructs.SimpleServerlessSparkJob.property.id"></a>

```typescript
public readonly id: string;
```

- *Type:* string

---

##### `policies`<sup>Required</sup> <a name="policies" id="ez-constructs.SimpleServerlessSparkJob.property.policies"></a>

```typescript
public readonly policies: PolicyStatement[];
```

- *Type:* aws-cdk-lib.aws_iam.PolicyStatement[]

---

##### `region`<sup>Required</sup> <a name="region" id="ez-constructs.SimpleServerlessSparkJob.property.region"></a>

```typescript
public readonly region: string;
```

- *Type:* string

---

##### `scope`<sup>Required</sup> <a name="scope" id="ez-constructs.SimpleServerlessSparkJob.property.scope"></a>

```typescript
public readonly scope: Construct;
```

- *Type:* constructs.Construct

---

##### `stateDefinitionAsString`<sup>Required</sup> <a name="stateDefinitionAsString" id="ez-constructs.SimpleServerlessSparkJob.property.stateDefinitionAsString"></a>

```typescript
public readonly stateDefinitionAsString: string;
```

- *Type:* string

Returns the state definition as a string if the original state definition used was string.

Otherwise returns empty string.

---

##### `stateDefinitionBody`<sup>Required</sup> <a name="stateDefinitionBody" id="ez-constructs.SimpleServerlessSparkJob.property.stateDefinitionBody"></a>

```typescript
public readonly stateDefinitionBody: DefinitionBody;
```

- *Type:* aws-cdk-lib.aws_stepfunctions.DefinitionBody

Returns the state definition body object.

---

##### `stateMachine`<sup>Required</sup> <a name="stateMachine" id="ez-constructs.SimpleServerlessSparkJob.property.stateMachine"></a>

```typescript
public readonly stateMachine: StateMachine;
```

- *Type:* aws-cdk-lib.aws_stepfunctions.StateMachine

The state machine instance created by this construct.

---

##### `stateMachineRole`<sup>Required</sup> <a name="stateMachineRole" id="ez-constructs.SimpleServerlessSparkJob.property.stateMachineRole"></a>

```typescript
public readonly stateMachineRole: IRole;
```

- *Type:* aws-cdk-lib.aws_iam.IRole

---

##### `stateDefinition`<sup>Required</sup> <a name="stateDefinition" id="ez-constructs.SimpleServerlessSparkJob.property.stateDefinition"></a>

```typescript
public readonly stateDefinition: string | IChainable;
```

- *Type:* string | aws-cdk-lib.aws_stepfunctions.IChainable

Sets the state definition, and if type of the value passed is a string, will also set the stateDefinition when it is a string.

---

##### `replacerLambdaFn`<sup>Required</sup> <a name="replacerLambdaFn" id="ez-constructs.SimpleServerlessSparkJob.property.replacerLambdaFn"></a>

```typescript
public readonly replacerLambdaFn: SingletonFunction;
```

- *Type:* aws-cdk-lib.aws_lambda.SingletonFunction

---

##### `validatorLambdaFn`<sup>Required</sup> <a name="validatorLambdaFn" id="ez-constructs.SimpleServerlessSparkJob.property.validatorLambdaFn"></a>

```typescript
public readonly validatorLambdaFn: SingletonFunction;
```

- *Type:* aws-cdk-lib.aws_lambda.SingletonFunction

---


### SimpleStepFunction <a name="SimpleStepFunction" id="ez-constructs.SimpleStepFunction"></a>

#### Initializers <a name="Initializers" id="ez-constructs.SimpleStepFunction.Initializer"></a>

```typescript
import { SimpleStepFunction } from 'ez-constructs'

new SimpleStepFunction(scope: Construct, id: string, stepFunctionName: string)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#ez-constructs.SimpleStepFunction.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#ez-constructs.SimpleStepFunction.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#ez-constructs.SimpleStepFunction.Initializer.parameter.stepFunctionName">stepFunctionName</a></code> | <code>string</code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="ez-constructs.SimpleStepFunction.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="ez-constructs.SimpleStepFunction.Initializer.parameter.id"></a>

- *Type:* string

---

##### `stepFunctionName`<sup>Required</sup> <a name="stepFunctionName" id="ez-constructs.SimpleStepFunction.Initializer.parameter.stepFunctionName"></a>

- *Type:* string

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#ez-constructs.SimpleStepFunction.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#ez-constructs.SimpleStepFunction.addPolicy">addPolicy</a></code> | *No description.* |
| <code><a href="#ez-constructs.SimpleStepFunction.assemble">assemble</a></code> | Assembles the state machine. |
| <code><a href="#ez-constructs.SimpleStepFunction.createDefaultStateMachineProps">createDefaultStateMachineProps</a></code> | *No description.* |
| <code><a href="#ez-constructs.SimpleStepFunction.createStateMachine">createStateMachine</a></code> | Creates state machine from the given props. |
| <code><a href="#ez-constructs.SimpleStepFunction.createStateMachineCloudWatchLogGroup">createStateMachineCloudWatchLogGroup</a></code> | creates bucket to store state machine logs. |
| <code><a href="#ez-constructs.SimpleStepFunction.createStateMachineRole">createStateMachineRole</a></code> | creates state machine role. |
| <code><a href="#ez-constructs.SimpleStepFunction.generateDefaultStateMachinePermissions">generateDefaultStateMachinePermissions</a></code> | Will add default permissions to the step function role. |
| <code><a href="#ez-constructs.SimpleStepFunction.grantPassRole">grantPassRole</a></code> | Grants pass role permissions to the state machine role. |
| <code><a href="#ez-constructs.SimpleStepFunction.logGroupName">logGroupName</a></code> | Sets the logGroupName. |
| <code><a href="#ez-constructs.SimpleStepFunction.modifyStateDefinition">modifyStateDefinition</a></code> | Modifies the supplied state definition string version of workflow defintion to include logging and tracing. |
| <code><a href="#ez-constructs.SimpleStepFunction.usingChainableDefinition">usingChainableDefinition</a></code> | *No description.* |
| <code><a href="#ez-constructs.SimpleStepFunction.usingStringDefinition">usingStringDefinition</a></code> | *No description.* |
| <code><a href="#ez-constructs.SimpleStepFunction.withDefaultInputs">withDefaultInputs</a></code> | Default inputs of the spark jobs. |

---

##### `toString` <a name="toString" id="ez-constructs.SimpleStepFunction.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `addPolicy` <a name="addPolicy" id="ez-constructs.SimpleStepFunction.addPolicy"></a>

```typescript
public addPolicy(policy: PolicyStatement): SimpleStepFunction
```

###### `policy`<sup>Required</sup> <a name="policy" id="ez-constructs.SimpleStepFunction.addPolicy.parameter.policy"></a>

- *Type:* aws-cdk-lib.aws_iam.PolicyStatement

---

##### `assemble` <a name="assemble" id="ez-constructs.SimpleStepFunction.assemble"></a>

```typescript
public assemble(stateMachineProps?: StateMachineProps): SimpleStepFunction
```

Assembles the state machine.

###### `stateMachineProps`<sup>Optional</sup> <a name="stateMachineProps" id="ez-constructs.SimpleStepFunction.assemble.parameter.stateMachineProps"></a>

- *Type:* aws-cdk-lib.aws_stepfunctions.StateMachineProps

---

##### `createDefaultStateMachineProps` <a name="createDefaultStateMachineProps" id="ez-constructs.SimpleStepFunction.createDefaultStateMachineProps"></a>

```typescript
public createDefaultStateMachineProps(stateMachineName: string, stateMachineRole: IRole, definitionBody: DefinitionBody, logGroup: ILogGroup): StateMachineProps
```

###### `stateMachineName`<sup>Required</sup> <a name="stateMachineName" id="ez-constructs.SimpleStepFunction.createDefaultStateMachineProps.parameter.stateMachineName"></a>

- *Type:* string

---

###### `stateMachineRole`<sup>Required</sup> <a name="stateMachineRole" id="ez-constructs.SimpleStepFunction.createDefaultStateMachineProps.parameter.stateMachineRole"></a>

- *Type:* aws-cdk-lib.aws_iam.IRole

---

###### `definitionBody`<sup>Required</sup> <a name="definitionBody" id="ez-constructs.SimpleStepFunction.createDefaultStateMachineProps.parameter.definitionBody"></a>

- *Type:* aws-cdk-lib.aws_stepfunctions.DefinitionBody

---

###### `logGroup`<sup>Required</sup> <a name="logGroup" id="ez-constructs.SimpleStepFunction.createDefaultStateMachineProps.parameter.logGroup"></a>

- *Type:* aws-cdk-lib.aws_logs.ILogGroup

---

##### `createStateMachine` <a name="createStateMachine" id="ez-constructs.SimpleStepFunction.createStateMachine"></a>

```typescript
public createStateMachine(stateMachineProps: StateMachineProps): StateMachine
```

Creates state machine from the given props.

###### `stateMachineProps`<sup>Required</sup> <a name="stateMachineProps" id="ez-constructs.SimpleStepFunction.createStateMachine.parameter.stateMachineProps"></a>

- *Type:* aws-cdk-lib.aws_stepfunctions.StateMachineProps

---

##### `createStateMachineCloudWatchLogGroup` <a name="createStateMachineCloudWatchLogGroup" id="ez-constructs.SimpleStepFunction.createStateMachineCloudWatchLogGroup"></a>

```typescript
public createStateMachineCloudWatchLogGroup(): ILogGroup
```

creates bucket to store state machine logs.

##### `createStateMachineRole` <a name="createStateMachineRole" id="ez-constructs.SimpleStepFunction.createStateMachineRole"></a>

```typescript
public createStateMachineRole(stateMachineName: string): IRole
```

creates state machine role.

###### `stateMachineName`<sup>Required</sup> <a name="stateMachineName" id="ez-constructs.SimpleStepFunction.createStateMachineRole.parameter.stateMachineName"></a>

- *Type:* string

---

##### `generateDefaultStateMachinePermissions` <a name="generateDefaultStateMachinePermissions" id="ez-constructs.SimpleStepFunction.generateDefaultStateMachinePermissions"></a>

```typescript
public generateDefaultStateMachinePermissions(): void
```

Will add default permissions to the step function role.

##### `grantPassRole` <a name="grantPassRole" id="ez-constructs.SimpleStepFunction.grantPassRole"></a>

```typescript
public grantPassRole(role: IRole): SimpleStepFunction
```

Grants pass role permissions to the state machine role.

###### `role`<sup>Required</sup> <a name="role" id="ez-constructs.SimpleStepFunction.grantPassRole.parameter.role"></a>

- *Type:* aws-cdk-lib.aws_iam.IRole

---

##### `logGroupName` <a name="logGroupName" id="ez-constructs.SimpleStepFunction.logGroupName"></a>

```typescript
public logGroupName(value: string): SimpleStepFunction
```

Sets the logGroupName.

###### `value`<sup>Required</sup> <a name="value" id="ez-constructs.SimpleStepFunction.logGroupName.parameter.value"></a>

- *Type:* string

name of the log group.

---

##### `modifyStateDefinition` <a name="modifyStateDefinition" id="ez-constructs.SimpleStepFunction.modifyStateDefinition"></a>

```typescript
public modifyStateDefinition(stateDef: string): string
```

Modifies the supplied state definition string version of workflow defintion to include logging and tracing.

###### `stateDef`<sup>Required</sup> <a name="stateDef" id="ez-constructs.SimpleStepFunction.modifyStateDefinition.parameter.stateDef"></a>

- *Type:* string

the state definition string.

---

##### `usingChainableDefinition` <a name="usingChainableDefinition" id="ez-constructs.SimpleStepFunction.usingChainableDefinition"></a>

```typescript
public usingChainableDefinition(stateDefinition: IChainable): SimpleStepFunction
```

###### `stateDefinition`<sup>Required</sup> <a name="stateDefinition" id="ez-constructs.SimpleStepFunction.usingChainableDefinition.parameter.stateDefinition"></a>

- *Type:* aws-cdk-lib.aws_stepfunctions.IChainable

---

##### `usingStringDefinition` <a name="usingStringDefinition" id="ez-constructs.SimpleStepFunction.usingStringDefinition"></a>

```typescript
public usingStringDefinition(stateDefinition: string): SimpleStepFunction
```

###### `stateDefinition`<sup>Required</sup> <a name="stateDefinition" id="ez-constructs.SimpleStepFunction.usingStringDefinition.parameter.stateDefinition"></a>

- *Type:* string

---

##### `withDefaultInputs` <a name="withDefaultInputs" id="ez-constructs.SimpleStepFunction.withDefaultInputs"></a>

```typescript
public withDefaultInputs(params: any): SimpleStepFunction
```

Default inputs of the spark jobs.

Example:-
 ```
 .withDefaultInputs({
     "SparkSubmitParameters": {
       "--conf spark.executor.memory=2g",
       "--conf spark.executor.cores=2"
     },
     "greetings": "Good morning",
     "personal": {
       "name": "John Doe",
       "age": 30
     }
  })
 ```

###### `params`<sup>Required</sup> <a name="params" id="ez-constructs.SimpleStepFunction.withDefaultInputs.parameter.params"></a>

- *Type:* any

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#ez-constructs.SimpleStepFunction.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="ez-constructs.SimpleStepFunction.isConstruct"></a>

```typescript
import { SimpleStepFunction } from 'ez-constructs'

SimpleStepFunction.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="ez-constructs.SimpleStepFunction.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#ez-constructs.SimpleStepFunction.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#ez-constructs.SimpleStepFunction.property.account">account</a></code> | <code>string</code> | *No description.* |
| <code><a href="#ez-constructs.SimpleStepFunction.property.defaultInputs">defaultInputs</a></code> | <code>any</code> | *No description.* |
| <code><a href="#ez-constructs.SimpleStepFunction.property.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#ez-constructs.SimpleStepFunction.property.policies">policies</a></code> | <code>aws-cdk-lib.aws_iam.PolicyStatement[]</code> | *No description.* |
| <code><a href="#ez-constructs.SimpleStepFunction.property.region">region</a></code> | <code>string</code> | *No description.* |
| <code><a href="#ez-constructs.SimpleStepFunction.property.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#ez-constructs.SimpleStepFunction.property.stateDefinitionAsString">stateDefinitionAsString</a></code> | <code>string</code> | Returns the state definition as a string if the original state definition used was string. |
| <code><a href="#ez-constructs.SimpleStepFunction.property.stateDefinitionBody">stateDefinitionBody</a></code> | <code>aws-cdk-lib.aws_stepfunctions.DefinitionBody</code> | Returns the state definition body object. |
| <code><a href="#ez-constructs.SimpleStepFunction.property.stateMachine">stateMachine</a></code> | <code>aws-cdk-lib.aws_stepfunctions.StateMachine</code> | The state machine instance created by this construct. |
| <code><a href="#ez-constructs.SimpleStepFunction.property.stateMachineRole">stateMachineRole</a></code> | <code>aws-cdk-lib.aws_iam.IRole</code> | *No description.* |
| <code><a href="#ez-constructs.SimpleStepFunction.property.stateDefinition">stateDefinition</a></code> | <code>string \| aws-cdk-lib.aws_stepfunctions.IChainable</code> | Sets the state definition, and if type of the value passed is a string, will also set the stateDefinition when it is a string. |

---

##### `node`<sup>Required</sup> <a name="node" id="ez-constructs.SimpleStepFunction.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `account`<sup>Required</sup> <a name="account" id="ez-constructs.SimpleStepFunction.property.account"></a>

```typescript
public readonly account: string;
```

- *Type:* string

---

##### `defaultInputs`<sup>Required</sup> <a name="defaultInputs" id="ez-constructs.SimpleStepFunction.property.defaultInputs"></a>

```typescript
public readonly defaultInputs: any;
```

- *Type:* any

---

##### `id`<sup>Required</sup> <a name="id" id="ez-constructs.SimpleStepFunction.property.id"></a>

```typescript
public readonly id: string;
```

- *Type:* string

---

##### `policies`<sup>Required</sup> <a name="policies" id="ez-constructs.SimpleStepFunction.property.policies"></a>

```typescript
public readonly policies: PolicyStatement[];
```

- *Type:* aws-cdk-lib.aws_iam.PolicyStatement[]

---

##### `region`<sup>Required</sup> <a name="region" id="ez-constructs.SimpleStepFunction.property.region"></a>

```typescript
public readonly region: string;
```

- *Type:* string

---

##### `scope`<sup>Required</sup> <a name="scope" id="ez-constructs.SimpleStepFunction.property.scope"></a>

```typescript
public readonly scope: Construct;
```

- *Type:* constructs.Construct

---

##### `stateDefinitionAsString`<sup>Required</sup> <a name="stateDefinitionAsString" id="ez-constructs.SimpleStepFunction.property.stateDefinitionAsString"></a>

```typescript
public readonly stateDefinitionAsString: string;
```

- *Type:* string

Returns the state definition as a string if the original state definition used was string.

Otherwise returns empty string.

---

##### `stateDefinitionBody`<sup>Required</sup> <a name="stateDefinitionBody" id="ez-constructs.SimpleStepFunction.property.stateDefinitionBody"></a>

```typescript
public readonly stateDefinitionBody: DefinitionBody;
```

- *Type:* aws-cdk-lib.aws_stepfunctions.DefinitionBody

Returns the state definition body object.

---

##### `stateMachine`<sup>Required</sup> <a name="stateMachine" id="ez-constructs.SimpleStepFunction.property.stateMachine"></a>

```typescript
public readonly stateMachine: StateMachine;
```

- *Type:* aws-cdk-lib.aws_stepfunctions.StateMachine

The state machine instance created by this construct.

---

##### `stateMachineRole`<sup>Required</sup> <a name="stateMachineRole" id="ez-constructs.SimpleStepFunction.property.stateMachineRole"></a>

```typescript
public readonly stateMachineRole: IRole;
```

- *Type:* aws-cdk-lib.aws_iam.IRole

---

##### `stateDefinition`<sup>Required</sup> <a name="stateDefinition" id="ez-constructs.SimpleStepFunction.property.stateDefinition"></a>

```typescript
public readonly stateDefinition: string | IChainable;
```

- *Type:* string | aws-cdk-lib.aws_stepfunctions.IChainable

Sets the state definition, and if type of the value passed is a string, will also set the stateDefinition when it is a string.

---


## Structs <a name="Structs" id="Structs"></a>

### StandardSparkSubmitJobTemplate <a name="StandardSparkSubmitJobTemplate" id="ez-constructs.StandardSparkSubmitJobTemplate"></a>

A standard spark submit job template.

#### Initializer <a name="Initializer" id="ez-constructs.StandardSparkSubmitJobTemplate.Initializer"></a>

```typescript
import { StandardSparkSubmitJobTemplate } from 'ez-constructs'

const standardSparkSubmitJobTemplate: StandardSparkSubmitJobTemplate = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#ez-constructs.StandardSparkSubmitJobTemplate.property.entryPoint">entryPoint</a></code> | <code>string</code> | The S3 URL of the spark application's main file in Amazon S3. |
| <code><a href="#ez-constructs.StandardSparkSubmitJobTemplate.property.jobName">jobName</a></code> | <code>string</code> | The name of the job.*required*. |
| <code><a href="#ez-constructs.StandardSparkSubmitJobTemplate.property.applicationConfiguration">applicationConfiguration</a></code> | <code>aws-cdk-lib.aws_stepfunctions_tasks.ApplicationConfiguration[]</code> | Any version of overrides to use while provisioning EMR job. |
| <code><a href="#ez-constructs.StandardSparkSubmitJobTemplate.property.enableMonitoring">enableMonitoring</a></code> | <code>boolean</code> | True if monitoring must be enabled. |
| <code><a href="#ez-constructs.StandardSparkSubmitJobTemplate.property.entryPointArgumentNames">entryPointArgumentNames</a></code> | <code>string[]</code> | The names of the arguments to pass to the application. |
| <code><a href="#ez-constructs.StandardSparkSubmitJobTemplate.property.mainClass">mainClass</a></code> | <code>string</code> | The name of the application's main class,only applicable for Java/Scala Spark applications. |
| <code><a href="#ez-constructs.StandardSparkSubmitJobTemplate.property.sparkSubmitParameters">sparkSubmitParameters</a></code> | <code>string</code> | The arguments to pass to the application. |

---

##### `entryPoint`<sup>Required</sup> <a name="entryPoint" id="ez-constructs.StandardSparkSubmitJobTemplate.property.entryPoint"></a>

```typescript
public readonly entryPoint: string;
```

- *Type:* string

The S3 URL of the spark application's main file in Amazon S3.

A jar file for Scala and Java Spark applications and a Python file for pySpark applications.

---

##### `jobName`<sup>Required</sup> <a name="jobName" id="ez-constructs.StandardSparkSubmitJobTemplate.property.jobName"></a>

```typescript
public readonly jobName: string;
```

- *Type:* string

The name of the job.*required*.

---

##### `applicationConfiguration`<sup>Optional</sup> <a name="applicationConfiguration" id="ez-constructs.StandardSparkSubmitJobTemplate.property.applicationConfiguration"></a>

```typescript
public readonly applicationConfiguration: ApplicationConfiguration[];
```

- *Type:* aws-cdk-lib.aws_stepfunctions_tasks.ApplicationConfiguration[]

Any version of overrides to use while provisioning EMR job.

---

##### `enableMonitoring`<sup>Optional</sup> <a name="enableMonitoring" id="ez-constructs.StandardSparkSubmitJobTemplate.property.enableMonitoring"></a>

```typescript
public readonly enableMonitoring: boolean;
```

- *Type:* boolean

True if monitoring must be enabled.

Defaults to true.

---

##### `entryPointArgumentNames`<sup>Optional</sup> <a name="entryPointArgumentNames" id="ez-constructs.StandardSparkSubmitJobTemplate.property.entryPointArgumentNames"></a>

```typescript
public readonly entryPointArgumentNames: string[];
```

- *Type:* string[]

The names of the arguments to pass to the application.

The actual argument value should be specified during step funciton execution time.

---

##### `mainClass`<sup>Optional</sup> <a name="mainClass" id="ez-constructs.StandardSparkSubmitJobTemplate.property.mainClass"></a>

```typescript
public readonly mainClass: string;
```

- *Type:* string

The name of the application's main class,only applicable for Java/Scala Spark applications.

---

##### `sparkSubmitParameters`<sup>Optional</sup> <a name="sparkSubmitParameters" id="ez-constructs.StandardSparkSubmitJobTemplate.property.sparkSubmitParameters"></a>

```typescript
public readonly sparkSubmitParameters: string;
```

- *Type:* string

The arguments to pass to the application.

---

## Classes <a name="Classes" id="Classes"></a>

### CustomSynthesizer <a name="CustomSynthesizer" id="ez-constructs.CustomSynthesizer"></a>

As a best practice organizations enforce policies which require all custom IAM Roles created to be defined under a specific path and permission boundary.

In order to adhere with such compliance requirements, the CDK bootstrapping is often customized
(refer: https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping.html#bootstrapping-customizing).
So, we need to ensure that parallel customization is applied during synthesis phase.
This Custom Synthesizer is used to modify the default path of the following IAM Roles internally used by CDK:
 - deploy role
 - file-publishing-role
 - image-publishing-role
 - cfn-exec-role
 - lookup-role

> [PermissionsBoundaryAspect *
Example Usage:
```ts
new DbStack(app, config.id('apiDbStack'), {
env: {account: '123456789012', region: 'us-east-1'},
synthesizer: new CustomSynthesizer('/banking/dev/'),
});
```](PermissionsBoundaryAspect *
Example Usage:
```ts
new DbStack(app, config.id('apiDbStack'), {
env: {account: '123456789012', region: 'us-east-1'},
synthesizer: new CustomSynthesizer('/banking/dev/'),
});
```)

#### Initializers <a name="Initializers" id="ez-constructs.CustomSynthesizer.Initializer"></a>

```typescript
import { CustomSynthesizer } from 'ez-constructs'

new CustomSynthesizer(rolePath: string)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#ez-constructs.CustomSynthesizer.Initializer.parameter.rolePath">rolePath</a></code> | <code>string</code> | *No description.* |

---

##### `rolePath`<sup>Required</sup> <a name="rolePath" id="ez-constructs.CustomSynthesizer.Initializer.parameter.rolePath"></a>

- *Type:* string

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#ez-constructs.CustomSynthesizer.addDockerImageAsset">addDockerImageAsset</a></code> | Register a Docker Image Asset. |
| <code><a href="#ez-constructs.CustomSynthesizer.addFileAsset">addFileAsset</a></code> | Register a File Asset. |
| <code><a href="#ez-constructs.CustomSynthesizer.bind">bind</a></code> | Bind to the stack this environment is going to be used on. |
| <code><a href="#ez-constructs.CustomSynthesizer.synthesize">synthesize</a></code> | Synthesize the associated stack to the session. |
| <code><a href="#ez-constructs.CustomSynthesizer.reusableBind">reusableBind</a></code> | Produce a bound Stack Synthesizer for the given stack. |

---

##### `addDockerImageAsset` <a name="addDockerImageAsset" id="ez-constructs.CustomSynthesizer.addDockerImageAsset"></a>

```typescript
public addDockerImageAsset(asset: DockerImageAssetSource): DockerImageAssetLocation
```

Register a Docker Image Asset.

Returns the parameters that can be used to refer to the asset inside the template.

The synthesizer must rely on some out-of-band mechanism to make sure the given files
are actually placed in the returned location before the deployment happens. This can
be by writing the instructions to the asset manifest (for use by the `cdk-assets` tool),
by relying on the CLI to upload files (legacy behavior), or some other operator controlled
mechanism.

###### `asset`<sup>Required</sup> <a name="asset" id="ez-constructs.CustomSynthesizer.addDockerImageAsset.parameter.asset"></a>

- *Type:* aws-cdk-lib.DockerImageAssetSource

---

##### `addFileAsset` <a name="addFileAsset" id="ez-constructs.CustomSynthesizer.addFileAsset"></a>

```typescript
public addFileAsset(asset: FileAssetSource): FileAssetLocation
```

Register a File Asset.

Returns the parameters that can be used to refer to the asset inside the template.

The synthesizer must rely on some out-of-band mechanism to make sure the given files
are actually placed in the returned location before the deployment happens. This can
be by writing the instructions to the asset manifest (for use by the `cdk-assets` tool),
by relying on the CLI to upload files (legacy behavior), or some other operator controlled
mechanism.

###### `asset`<sup>Required</sup> <a name="asset" id="ez-constructs.CustomSynthesizer.addFileAsset.parameter.asset"></a>

- *Type:* aws-cdk-lib.FileAssetSource

---

##### `bind` <a name="bind" id="ez-constructs.CustomSynthesizer.bind"></a>

```typescript
public bind(stack: Stack): void
```

Bind to the stack this environment is going to be used on.

Must be called before any of the other methods are called.

###### `stack`<sup>Required</sup> <a name="stack" id="ez-constructs.CustomSynthesizer.bind.parameter.stack"></a>

- *Type:* aws-cdk-lib.Stack

---

##### `synthesize` <a name="synthesize" id="ez-constructs.CustomSynthesizer.synthesize"></a>

```typescript
public synthesize(session: ISynthesisSession): void
```

Synthesize the associated stack to the session.

###### `session`<sup>Required</sup> <a name="session" id="ez-constructs.CustomSynthesizer.synthesize.parameter.session"></a>

- *Type:* aws-cdk-lib.ISynthesisSession

---

##### `reusableBind` <a name="reusableBind" id="ez-constructs.CustomSynthesizer.reusableBind"></a>

```typescript
public reusableBind(stack: Stack): IBoundStackSynthesizer
```

Produce a bound Stack Synthesizer for the given stack.

This method may be called more than once on the same object.

###### `stack`<sup>Required</sup> <a name="stack" id="ez-constructs.CustomSynthesizer.reusableBind.parameter.stack"></a>

- *Type:* aws-cdk-lib.Stack

---


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#ez-constructs.CustomSynthesizer.property.bootstrapQualifier">bootstrapQualifier</a></code> | <code>string</code> | The qualifier used to bootstrap this stack. |
| <code><a href="#ez-constructs.CustomSynthesizer.property.lookupRole">lookupRole</a></code> | <code>string</code> | The role used to lookup for this stack. |
| <code><a href="#ez-constructs.CustomSynthesizer.property.cloudFormationExecutionRoleArn">cloudFormationExecutionRoleArn</a></code> | <code>string</code> | Returns the ARN of the CFN execution Role. |
| <code><a href="#ez-constructs.CustomSynthesizer.property.deployRoleArn">deployRoleArn</a></code> | <code>string</code> | Returns the ARN of the deploy Role. |

---

##### `bootstrapQualifier`<sup>Optional</sup> <a name="bootstrapQualifier" id="ez-constructs.CustomSynthesizer.property.bootstrapQualifier"></a>

```typescript
public readonly bootstrapQualifier: string;
```

- *Type:* string

The qualifier used to bootstrap this stack.

---

##### `lookupRole`<sup>Optional</sup> <a name="lookupRole" id="ez-constructs.CustomSynthesizer.property.lookupRole"></a>

```typescript
public readonly lookupRole: string;
```

- *Type:* string

The role used to lookup for this stack.

---

##### `cloudFormationExecutionRoleArn`<sup>Required</sup> <a name="cloudFormationExecutionRoleArn" id="ez-constructs.CustomSynthesizer.property.cloudFormationExecutionRoleArn"></a>

```typescript
public readonly cloudFormationExecutionRoleArn: string;
```

- *Type:* string

Returns the ARN of the CFN execution Role.

---

##### `deployRoleArn`<sup>Required</sup> <a name="deployRoleArn" id="ez-constructs.CustomSynthesizer.property.deployRoleArn"></a>

```typescript
public readonly deployRoleArn: string;
```

- *Type:* string

Returns the ARN of the deploy Role.

---

#### Constants <a name="Constants" id="Constants"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#ez-constructs.CustomSynthesizer.property.DEFAULT_BOOTSTRAP_STACK_VERSION_SSM_PARAMETER">DEFAULT_BOOTSTRAP_STACK_VERSION_SSM_PARAMETER</a></code> | <code>string</code> | Default bootstrap stack version SSM parameter. |
| <code><a href="#ez-constructs.CustomSynthesizer.property.DEFAULT_CLOUDFORMATION_ROLE_ARN">DEFAULT_CLOUDFORMATION_ROLE_ARN</a></code> | <code>string</code> | Default CloudFormation role ARN. |
| <code><a href="#ez-constructs.CustomSynthesizer.property.DEFAULT_DEPLOY_ROLE_ARN">DEFAULT_DEPLOY_ROLE_ARN</a></code> | <code>string</code> | Default deploy role ARN. |
| <code><a href="#ez-constructs.CustomSynthesizer.property.DEFAULT_DOCKER_ASSET_PREFIX">DEFAULT_DOCKER_ASSET_PREFIX</a></code> | <code>string</code> | Default Docker asset prefix. |
| <code><a href="#ez-constructs.CustomSynthesizer.property.DEFAULT_FILE_ASSET_KEY_ARN_EXPORT_NAME">DEFAULT_FILE_ASSET_KEY_ARN_EXPORT_NAME</a></code> | <code>string</code> | Name of the CloudFormation Export with the asset key name. |
| <code><a href="#ez-constructs.CustomSynthesizer.property.DEFAULT_FILE_ASSET_PREFIX">DEFAULT_FILE_ASSET_PREFIX</a></code> | <code>string</code> | Default file asset prefix. |
| <code><a href="#ez-constructs.CustomSynthesizer.property.DEFAULT_FILE_ASSET_PUBLISHING_ROLE_ARN">DEFAULT_FILE_ASSET_PUBLISHING_ROLE_ARN</a></code> | <code>string</code> | Default asset publishing role ARN for file (S3) assets. |
| <code><a href="#ez-constructs.CustomSynthesizer.property.DEFAULT_FILE_ASSETS_BUCKET_NAME">DEFAULT_FILE_ASSETS_BUCKET_NAME</a></code> | <code>string</code> | Default file assets bucket name. |
| <code><a href="#ez-constructs.CustomSynthesizer.property.DEFAULT_IMAGE_ASSET_PUBLISHING_ROLE_ARN">DEFAULT_IMAGE_ASSET_PUBLISHING_ROLE_ARN</a></code> | <code>string</code> | Default asset publishing role ARN for image (ECR) assets. |
| <code><a href="#ez-constructs.CustomSynthesizer.property.DEFAULT_IMAGE_ASSETS_REPOSITORY_NAME">DEFAULT_IMAGE_ASSETS_REPOSITORY_NAME</a></code> | <code>string</code> | Default image assets repository name. |
| <code><a href="#ez-constructs.CustomSynthesizer.property.DEFAULT_LOOKUP_ROLE_ARN">DEFAULT_LOOKUP_ROLE_ARN</a></code> | <code>string</code> | Default lookup role ARN for missing values. |
| <code><a href="#ez-constructs.CustomSynthesizer.property.DEFAULT_QUALIFIER">DEFAULT_QUALIFIER</a></code> | <code>string</code> | Default ARN qualifier. |

---

##### `DEFAULT_BOOTSTRAP_STACK_VERSION_SSM_PARAMETER`<sup>Required</sup> <a name="DEFAULT_BOOTSTRAP_STACK_VERSION_SSM_PARAMETER" id="ez-constructs.CustomSynthesizer.property.DEFAULT_BOOTSTRAP_STACK_VERSION_SSM_PARAMETER"></a>

```typescript
public readonly DEFAULT_BOOTSTRAP_STACK_VERSION_SSM_PARAMETER: string;
```

- *Type:* string

Default bootstrap stack version SSM parameter.

---

##### `DEFAULT_CLOUDFORMATION_ROLE_ARN`<sup>Required</sup> <a name="DEFAULT_CLOUDFORMATION_ROLE_ARN" id="ez-constructs.CustomSynthesizer.property.DEFAULT_CLOUDFORMATION_ROLE_ARN"></a>

```typescript
public readonly DEFAULT_CLOUDFORMATION_ROLE_ARN: string;
```

- *Type:* string

Default CloudFormation role ARN.

---

##### `DEFAULT_DEPLOY_ROLE_ARN`<sup>Required</sup> <a name="DEFAULT_DEPLOY_ROLE_ARN" id="ez-constructs.CustomSynthesizer.property.DEFAULT_DEPLOY_ROLE_ARN"></a>

```typescript
public readonly DEFAULT_DEPLOY_ROLE_ARN: string;
```

- *Type:* string

Default deploy role ARN.

---

##### `DEFAULT_DOCKER_ASSET_PREFIX`<sup>Required</sup> <a name="DEFAULT_DOCKER_ASSET_PREFIX" id="ez-constructs.CustomSynthesizer.property.DEFAULT_DOCKER_ASSET_PREFIX"></a>

```typescript
public readonly DEFAULT_DOCKER_ASSET_PREFIX: string;
```

- *Type:* string

Default Docker asset prefix.

---

##### `DEFAULT_FILE_ASSET_KEY_ARN_EXPORT_NAME`<sup>Required</sup> <a name="DEFAULT_FILE_ASSET_KEY_ARN_EXPORT_NAME" id="ez-constructs.CustomSynthesizer.property.DEFAULT_FILE_ASSET_KEY_ARN_EXPORT_NAME"></a>

```typescript
public readonly DEFAULT_FILE_ASSET_KEY_ARN_EXPORT_NAME: string;
```

- *Type:* string

Name of the CloudFormation Export with the asset key name.

---

##### `DEFAULT_FILE_ASSET_PREFIX`<sup>Required</sup> <a name="DEFAULT_FILE_ASSET_PREFIX" id="ez-constructs.CustomSynthesizer.property.DEFAULT_FILE_ASSET_PREFIX"></a>

```typescript
public readonly DEFAULT_FILE_ASSET_PREFIX: string;
```

- *Type:* string

Default file asset prefix.

---

##### `DEFAULT_FILE_ASSET_PUBLISHING_ROLE_ARN`<sup>Required</sup> <a name="DEFAULT_FILE_ASSET_PUBLISHING_ROLE_ARN" id="ez-constructs.CustomSynthesizer.property.DEFAULT_FILE_ASSET_PUBLISHING_ROLE_ARN"></a>

```typescript
public readonly DEFAULT_FILE_ASSET_PUBLISHING_ROLE_ARN: string;
```

- *Type:* string

Default asset publishing role ARN for file (S3) assets.

---

##### `DEFAULT_FILE_ASSETS_BUCKET_NAME`<sup>Required</sup> <a name="DEFAULT_FILE_ASSETS_BUCKET_NAME" id="ez-constructs.CustomSynthesizer.property.DEFAULT_FILE_ASSETS_BUCKET_NAME"></a>

```typescript
public readonly DEFAULT_FILE_ASSETS_BUCKET_NAME: string;
```

- *Type:* string

Default file assets bucket name.

---

##### `DEFAULT_IMAGE_ASSET_PUBLISHING_ROLE_ARN`<sup>Required</sup> <a name="DEFAULT_IMAGE_ASSET_PUBLISHING_ROLE_ARN" id="ez-constructs.CustomSynthesizer.property.DEFAULT_IMAGE_ASSET_PUBLISHING_ROLE_ARN"></a>

```typescript
public readonly DEFAULT_IMAGE_ASSET_PUBLISHING_ROLE_ARN: string;
```

- *Type:* string

Default asset publishing role ARN for image (ECR) assets.

---

##### `DEFAULT_IMAGE_ASSETS_REPOSITORY_NAME`<sup>Required</sup> <a name="DEFAULT_IMAGE_ASSETS_REPOSITORY_NAME" id="ez-constructs.CustomSynthesizer.property.DEFAULT_IMAGE_ASSETS_REPOSITORY_NAME"></a>

```typescript
public readonly DEFAULT_IMAGE_ASSETS_REPOSITORY_NAME: string;
```

- *Type:* string

Default image assets repository name.

---

##### `DEFAULT_LOOKUP_ROLE_ARN`<sup>Required</sup> <a name="DEFAULT_LOOKUP_ROLE_ARN" id="ez-constructs.CustomSynthesizer.property.DEFAULT_LOOKUP_ROLE_ARN"></a>

```typescript
public readonly DEFAULT_LOOKUP_ROLE_ARN: string;
```

- *Type:* string

Default lookup role ARN for missing values.

---

##### `DEFAULT_QUALIFIER`<sup>Required</sup> <a name="DEFAULT_QUALIFIER" id="ez-constructs.CustomSynthesizer.property.DEFAULT_QUALIFIER"></a>

```typescript
public readonly DEFAULT_QUALIFIER: string;
```

- *Type:* string

Default ARN qualifier.

---

### FileUtils <a name="FileUtils" id="ez-constructs.FileUtils"></a>

#### Initializers <a name="Initializers" id="ez-constructs.FileUtils.Initializer"></a>

```typescript
import { FileUtils } from 'ez-constructs'

new FileUtils()
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |

---


#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#ez-constructs.FileUtils.readFile">readFile</a></code> | Will read the file from the given path and return the content as a string. |

---

##### `readFile` <a name="readFile" id="ez-constructs.FileUtils.readFile"></a>

```typescript
import { FileUtils } from 'ez-constructs'

FileUtils.readFile(path: string)
```

Will read the file from the given path and return the content as a string.

###### `path`<sup>Required</sup> <a name="path" id="ez-constructs.FileUtils.readFile.parameter.path"></a>

- *Type:* string

---



### PermissionsBoundaryAspect <a name="PermissionsBoundaryAspect" id="ez-constructs.PermissionsBoundaryAspect"></a>

- *Implements:* aws-cdk-lib.IAspect

As a best practice organizations enforce policies which require all custom IAM Roles created to be defined under a specific path and permission boundary.

Well, this allows better governance and also prevents unintended privilege escalation.
AWS CDK high level constructs and patterns encapsulates the role creation from end users.
So it is a laborious and at times impossible to get a handle of newly created roles within a stack.
This aspect will scan all roles within the given scope and will attach the right permission boundary and path to them.
Example:
```ts
   const app = new App();
   const mystack = new MyStack(app, 'MyConstruct'); // assuming this will create a role by name `myCodeBuildRole` with admin access.
   Aspects.of(app).add(new PermissionsBoundaryAspect('/my/devroles/', 'boundary/dev-max'));
```

#### Initializers <a name="Initializers" id="ez-constructs.PermissionsBoundaryAspect.Initializer"></a>

```typescript
import { PermissionsBoundaryAspect } from 'ez-constructs'

new PermissionsBoundaryAspect(rolePath: string, rolePermissionBoundary: string)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#ez-constructs.PermissionsBoundaryAspect.Initializer.parameter.rolePath">rolePath</a></code> | <code>string</code> | - the role path to attach to newly created roles. |
| <code><a href="#ez-constructs.PermissionsBoundaryAspect.Initializer.parameter.rolePermissionBoundary">rolePermissionBoundary</a></code> | <code>string</code> | - the permission boundary to attach to newly created roles. |

---

##### `rolePath`<sup>Required</sup> <a name="rolePath" id="ez-constructs.PermissionsBoundaryAspect.Initializer.parameter.rolePath"></a>

- *Type:* string

the role path to attach to newly created roles.

---

##### `rolePermissionBoundary`<sup>Required</sup> <a name="rolePermissionBoundary" id="ez-constructs.PermissionsBoundaryAspect.Initializer.parameter.rolePermissionBoundary"></a>

- *Type:* string

the permission boundary to attach to newly created roles.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#ez-constructs.PermissionsBoundaryAspect.modifyRolePath">modifyRolePath</a></code> | *No description.* |
| <code><a href="#ez-constructs.PermissionsBoundaryAspect.visit">visit</a></code> | All aspects can visit an IConstruct. |

---

##### `modifyRolePath` <a name="modifyRolePath" id="ez-constructs.PermissionsBoundaryAspect.modifyRolePath"></a>

```typescript
public modifyRolePath(roleResource: CfnRole, stack: Stack, skipBoundary?: boolean): void
```

###### `roleResource`<sup>Required</sup> <a name="roleResource" id="ez-constructs.PermissionsBoundaryAspect.modifyRolePath.parameter.roleResource"></a>

- *Type:* aws-cdk-lib.aws_iam.CfnRole

---

###### `stack`<sup>Required</sup> <a name="stack" id="ez-constructs.PermissionsBoundaryAspect.modifyRolePath.parameter.stack"></a>

- *Type:* aws-cdk-lib.Stack

---

###### `skipBoundary`<sup>Optional</sup> <a name="skipBoundary" id="ez-constructs.PermissionsBoundaryAspect.modifyRolePath.parameter.skipBoundary"></a>

- *Type:* boolean

---

##### `visit` <a name="visit" id="ez-constructs.PermissionsBoundaryAspect.visit"></a>

```typescript
public visit(node: IConstruct): void
```

All aspects can visit an IConstruct.

###### `node`<sup>Required</sup> <a name="node" id="ez-constructs.PermissionsBoundaryAspect.visit.parameter.node"></a>

- *Type:* constructs.IConstruct

---


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#ez-constructs.PermissionsBoundaryAspect.property.rolePath">rolePath</a></code> | <code>string</code> | The role path to attach to newly created roles. |
| <code><a href="#ez-constructs.PermissionsBoundaryAspect.property.rolePermissionBoundary">rolePermissionBoundary</a></code> | <code>string</code> | The permission boundary to attach to newly created roles. |

---

##### `rolePath`<sup>Required</sup> <a name="rolePath" id="ez-constructs.PermissionsBoundaryAspect.property.rolePath"></a>

```typescript
public readonly rolePath: string;
```

- *Type:* string

The role path to attach to newly created roles.

---

##### `rolePermissionBoundary`<sup>Required</sup> <a name="rolePermissionBoundary" id="ez-constructs.PermissionsBoundaryAspect.property.rolePermissionBoundary"></a>

```typescript
public readonly rolePermissionBoundary: string;
```

- *Type:* string

The permission boundary to attach to newly created roles.

---


### Utils <a name="Utils" id="ez-constructs.Utils"></a>

A utility class that have common functions.

#### Initializers <a name="Initializers" id="ez-constructs.Utils.Initializer"></a>

```typescript
import { Utils } from 'ez-constructs'

new Utils()
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |

---


#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#ez-constructs.Utils.appendIfNecessary">appendIfNecessary</a></code> | Will append the suffix to the given name if the name do not contain the suffix. |
| <code><a href="#ez-constructs.Utils.camelCase">camelCase</a></code> | Will convert the given string to camel case. |
| <code><a href="#ez-constructs.Utils.contains">contains</a></code> | Will check if the given string is contained in another string. |
| <code><a href="#ez-constructs.Utils.endsWith">endsWith</a></code> | Will check if the given string ends with the given suffix. |
| <code><a href="#ez-constructs.Utils.escapeDoubleQuotes">escapeDoubleQuotes</a></code> | Will escape double quotes in the given string. |
| <code><a href="#ez-constructs.Utils.fetchStepFuncitonStateDefinition">fetchStepFuncitonStateDefinition</a></code> | A utility function that will obtain the first state machine definition from the given stack. |
| <code><a href="#ez-constructs.Utils.isEmpty">isEmpty</a></code> | Will check if the given object is empty. |
| <code><a href="#ez-constructs.Utils.join">join</a></code> | joins a string array using the given seperator. |
| <code><a href="#ez-constructs.Utils.kebabCase">kebabCase</a></code> | Will convert the given string to lower case and transform any spaces to hyphens. |
| <code><a href="#ez-constructs.Utils.merge">merge</a></code> | Merges two objects. |
| <code><a href="#ez-constructs.Utils.parseGithubUrl">parseGithubUrl</a></code> | Splits a given Github URL and extracts the owner and repo name. |
| <code><a href="#ez-constructs.Utils.prettyPrintStack">prettyPrintStack</a></code> | A utility function that will print the content of a CDK stack. |
| <code><a href="#ez-constructs.Utils.startsWith">startsWith</a></code> | Will check if the given string starts with the given prefix. |
| <code><a href="#ez-constructs.Utils.suppressNagRule">suppressNagRule</a></code> | Will disable the CDK NAG rule for the given construct and its children. |
| <code><a href="#ez-constructs.Utils.wrap">wrap</a></code> | Will wrap the given string using the given delimiter. |

---

##### `appendIfNecessary` <a name="appendIfNecessary" id="ez-constructs.Utils.appendIfNecessary"></a>

```typescript
import { Utils } from 'ez-constructs'

Utils.appendIfNecessary(name: string, suffixes: ...string[])
```

Will append the suffix to the given name if the name do not contain the suffix.

###### `name`<sup>Required</sup> <a name="name" id="ez-constructs.Utils.appendIfNecessary.parameter.name"></a>

- *Type:* string

a string.

---

###### `suffixes`<sup>Required</sup> <a name="suffixes" id="ez-constructs.Utils.appendIfNecessary.parameter.suffixes"></a>

- *Type:* ...string[]

the string to append.

---

##### `camelCase` <a name="camelCase" id="ez-constructs.Utils.camelCase"></a>

```typescript
import { Utils } from 'ez-constructs'

Utils.camelCase(str: string)
```

Will convert the given string to camel case.

###### `str`<sup>Required</sup> <a name="str" id="ez-constructs.Utils.camelCase.parameter.str"></a>

- *Type:* string

a string.

---

##### `contains` <a name="contains" id="ez-constructs.Utils.contains"></a>

```typescript
import { Utils } from 'ez-constructs'

Utils.contains(str: string, s: string)
```

Will check if the given string is contained in another string.

###### `str`<sup>Required</sup> <a name="str" id="ez-constructs.Utils.contains.parameter.str"></a>

- *Type:* string

a string.

---

###### `s`<sup>Required</sup> <a name="s" id="ez-constructs.Utils.contains.parameter.s"></a>

- *Type:* string

the string to check for.

---

##### `endsWith` <a name="endsWith" id="ez-constructs.Utils.endsWith"></a>

```typescript
import { Utils } from 'ez-constructs'

Utils.endsWith(str: string, s: string)
```

Will check if the given string ends with the given suffix.

###### `str`<sup>Required</sup> <a name="str" id="ez-constructs.Utils.endsWith.parameter.str"></a>

- *Type:* string

a string.

---

###### `s`<sup>Required</sup> <a name="s" id="ez-constructs.Utils.endsWith.parameter.s"></a>

- *Type:* string

suffix to check.

---

##### `escapeDoubleQuotes` <a name="escapeDoubleQuotes" id="ez-constructs.Utils.escapeDoubleQuotes"></a>

```typescript
import { Utils } from 'ez-constructs'

Utils.escapeDoubleQuotes(str: string)
```

Will escape double quotes in the given string.

###### `str`<sup>Required</sup> <a name="str" id="ez-constructs.Utils.escapeDoubleQuotes.parameter.str"></a>

- *Type:* string

---

##### `fetchStepFuncitonStateDefinition` <a name="fetchStepFuncitonStateDefinition" id="ez-constructs.Utils.fetchStepFuncitonStateDefinition"></a>

```typescript
import { Utils } from 'ez-constructs'

Utils.fetchStepFuncitonStateDefinition(stack: Stack)
```

A utility function that will obtain the first state machine definition from the given stack.

###### `stack`<sup>Required</sup> <a name="stack" id="ez-constructs.Utils.fetchStepFuncitonStateDefinition.parameter.stack"></a>

- *Type:* aws-cdk-lib.Stack

a stack that contains at least one state machine resource.

---

##### `isEmpty` <a name="isEmpty" id="ez-constructs.Utils.isEmpty"></a>

```typescript
import { Utils } from 'ez-constructs'

Utils.isEmpty(value?: any)
```

Will check if the given object is empty.

###### `value`<sup>Optional</sup> <a name="value" id="ez-constructs.Utils.isEmpty.parameter.value"></a>

- *Type:* any

---

##### `join` <a name="join" id="ez-constructs.Utils.join"></a>

```typescript
import { Utils } from 'ez-constructs'

Utils.join(arr?: string[], separator?: string)
```

joins a string array using the given seperator.

###### `arr`<sup>Optional</sup> <a name="arr" id="ez-constructs.Utils.join.parameter.arr"></a>

- *Type:* string[]

---

###### `separator`<sup>Optional</sup> <a name="separator" id="ez-constructs.Utils.join.parameter.separator"></a>

- *Type:* string

---

##### `kebabCase` <a name="kebabCase" id="ez-constructs.Utils.kebabCase"></a>

```typescript
import { Utils } from 'ez-constructs'

Utils.kebabCase(str: string)
```

Will convert the given string to lower case and transform any spaces to hyphens.

###### `str`<sup>Required</sup> <a name="str" id="ez-constructs.Utils.kebabCase.parameter.str"></a>

- *Type:* string

a string.

---

##### `merge` <a name="merge" id="ez-constructs.Utils.merge"></a>

```typescript
import { Utils } from 'ez-constructs'

Utils.merge(obj1: any, obj2: any)
```

Merges two objects.

###### `obj1`<sup>Required</sup> <a name="obj1" id="ez-constructs.Utils.merge.parameter.obj1"></a>

- *Type:* any

---

###### `obj2`<sup>Required</sup> <a name="obj2" id="ez-constructs.Utils.merge.parameter.obj2"></a>

- *Type:* any

---

##### `parseGithubUrl` <a name="parseGithubUrl" id="ez-constructs.Utils.parseGithubUrl"></a>

```typescript
import { Utils } from 'ez-constructs'

Utils.parseGithubUrl(url: string)
```

Splits a given Github URL and extracts the owner and repo name.

###### `url`<sup>Required</sup> <a name="url" id="ez-constructs.Utils.parseGithubUrl.parameter.url"></a>

- *Type:* string

---

##### `prettyPrintStack` <a name="prettyPrintStack" id="ez-constructs.Utils.prettyPrintStack"></a>

```typescript
import { Utils } from 'ez-constructs'

Utils.prettyPrintStack(stack: Stack, persist?: boolean, path?: string)
```

A utility function that will print the content of a CDK stack.

###### `stack`<sup>Required</sup> <a name="stack" id="ez-constructs.Utils.prettyPrintStack.parameter.stack"></a>

- *Type:* aws-cdk-lib.Stack

a valid stack.

---

###### `persist`<sup>Optional</sup> <a name="persist" id="ez-constructs.Utils.prettyPrintStack.parameter.persist"></a>

- *Type:* boolean

---

###### `path`<sup>Optional</sup> <a name="path" id="ez-constructs.Utils.prettyPrintStack.parameter.path"></a>

- *Type:* string

---

##### `startsWith` <a name="startsWith" id="ez-constructs.Utils.startsWith"></a>

```typescript
import { Utils } from 'ez-constructs'

Utils.startsWith(str: string, s: string)
```

Will check if the given string starts with the given prefix.

###### `str`<sup>Required</sup> <a name="str" id="ez-constructs.Utils.startsWith.parameter.str"></a>

- *Type:* string

a string.

---

###### `s`<sup>Required</sup> <a name="s" id="ez-constructs.Utils.startsWith.parameter.s"></a>

- *Type:* string

the prefix to check.

---

##### `suppressNagRule` <a name="suppressNagRule" id="ez-constructs.Utils.suppressNagRule"></a>

```typescript
import { Utils } from 'ez-constructs'

Utils.suppressNagRule(scope: IConstruct, ruleId: string, reason?: string)
```

Will disable the CDK NAG rule for the given construct and its children.

###### `scope`<sup>Required</sup> <a name="scope" id="ez-constructs.Utils.suppressNagRule.parameter.scope"></a>

- *Type:* constructs.IConstruct

the scope to disable the rule for.

---

###### `ruleId`<sup>Required</sup> <a name="ruleId" id="ez-constructs.Utils.suppressNagRule.parameter.ruleId"></a>

- *Type:* string

the rule id to disable.

---

###### `reason`<sup>Optional</sup> <a name="reason" id="ez-constructs.Utils.suppressNagRule.parameter.reason"></a>

- *Type:* string

reason for disabling the rule.

---

##### `wrap` <a name="wrap" id="ez-constructs.Utils.wrap"></a>

```typescript
import { Utils } from 'ez-constructs'

Utils.wrap(str: string, delimiter: string)
```

Will wrap the given string using the given delimiter.

###### `str`<sup>Required</sup> <a name="str" id="ez-constructs.Utils.wrap.parameter.str"></a>

- *Type:* string

the string to wrap.

---

###### `delimiter`<sup>Required</sup> <a name="delimiter" id="ez-constructs.Utils.wrap.parameter.delimiter"></a>

- *Type:* string

the delimiter to use.

---




## Enums <a name="Enums" id="Enums"></a>

### GitEvent <a name="GitEvent" id="ez-constructs.GitEvent"></a>

The Github events which should trigger this build.

#### Members <a name="Members" id="Members"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#ez-constructs.GitEvent.PULL_REQUEST">PULL_REQUEST</a></code> | *No description.* |
| <code><a href="#ez-constructs.GitEvent.PULL_REQUEST_MERGED">PULL_REQUEST_MERGED</a></code> | *No description.* |
| <code><a href="#ez-constructs.GitEvent.PUSH">PUSH</a></code> | *No description.* |
| <code><a href="#ez-constructs.GitEvent.ALL">ALL</a></code> | *No description.* |

---

##### `PULL_REQUEST` <a name="PULL_REQUEST" id="ez-constructs.GitEvent.PULL_REQUEST"></a>

---


##### `PULL_REQUEST_MERGED` <a name="PULL_REQUEST_MERGED" id="ez-constructs.GitEvent.PULL_REQUEST_MERGED"></a>

---


##### `PUSH` <a name="PUSH" id="ez-constructs.GitEvent.PUSH"></a>

---


##### `ALL` <a name="ALL" id="ez-constructs.GitEvent.ALL"></a>

---

