import {
  Artifacts,
  BuildSpec,
  ComputeType,
  EventAction,
  FilterGroup,
  IBuildImage,
  LinuxBuildImage,
  Project,
  ProjectProps,
  Source,
} from 'aws-cdk-lib/aws-codebuild';
import { BuildEnvironmentVariable } from 'aws-cdk-lib/aws-codebuild/lib/project';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { Repository } from 'aws-cdk-lib/aws-ecr';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { CodeBuildProject } from 'aws-cdk-lib/aws-events-targets';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { EzConstruct } from '../ez-construct';
import { Utils } from '../lib/utils';
import { SecureBucket } from '../secure-bucket';

/**
 * The Github events which should trigger this build.
 */
export enum GitEvent {
  PULL_REQUEST = 'pull_request',
  PULL_REQUEST_MERGED = 'pull_request_merged',
  PUSH = 'push',
  ALL = 'all',
}

/**
 * Most of the cases,a developer will use CodeBuild setup to perform simple CI tasks such as:
 * - Build and test your code on a PR
 * - Run a specific script based on a cron schedule.
 * Also, they might want:
 * - artifacts like testcase reports to be available via Reports UI and/or S3.
 * - logs to be available via CloudWatch Logs.
 *
 * However, there can be additional organizational retention policies, for example retaining logs for a particular period of time.
 * With this construct, you can easily create a basic CodeBuild project with many opinated defaults that are compliant with FISMA and NIST.
 *
 * Example, creates a project named `my-project`, with artifacts going to my-project-artifacts-<accountId>-<region>
 *  and logs going to `/aws/codebuild/my-project` log group with a retention period of 90 days and 14 months respectively.
 *
 * ```ts
 *    new SimpleCodebuildProject(stack, 'MyProject')
 *      .projectName('myproject')
 *      .gitRepoUrl('https://github.com/bijujoseph/cloudbiolinux.git')
 *      .gitBaseBranch('main')
 *      .triggerEvent(GitEvent.PULL_REQUEST)
 *      .buildSpecPath('buildspecs/my-pr-checker.yml')
 *      .assemble();
 * ```
 *
 */
export class SimpleCodebuildProject extends EzConstruct {

  private _project: Project | undefined;
  private _projectName?: string;
  private _projectDescription?: string;
  private _gitRepoUrl?: string;
  private _gitBaseBranch: string = 'develop';
  private _buildSpecPath?: string;
  private _grantReportGroupPermissions = true;
  private _privileged = false;
  private _skipArtifacts = false;
  private _triggerOnGitEvent?: GitEvent;
  private _triggerOnSchedule?: Schedule;
  private _triggerOnPushToBranches: Array<string> = [];
  private _artifactBucket?: IBucket | string;
  private _computType: ComputeType = ComputeType.MEDIUM;
  private _vpcId?: string;
  private _buildImage: IBuildImage = LinuxBuildImage.STANDARD_6_0;
  private _envVariables: {
    [name: string]: BuildEnvironmentVariable;
  } = {};
  private _trustedActorAccountIds?: string[];
  private _githubUserIds?: number[];

  // @ts-ignore
  private _props: ProjectProps;

  private readonly scope: Construct;
  // @ts-ignore
  private readonly id: string;

  constructor(scope: Construct, id: string) {
    super(scope, id);
    this.scope = scope;
    this.id = id;
  }

  /**
   * The underlying codebuild project that is created by this construct.
   */
  get project(): Project | undefined {
    return this._project;
  }

  /**
   * A convenient way to set the project environment variables.
   * The values set here will be presnted on the UI when build with overriding is used.
   * @param name - The environment variable name
   * @param envVar - The environment variable value
   *Example:
   *
   * ```ts
   *  project
   *    .addEnvironmentVariable('MY_ENV_VAR', {value: 'abcd})
   *    .addEnvironmentVariable('MY_ENV_VAR', {value: '/dev/thatkey, type: BuildEnvironmentVariableType.PARAMETER_STORE})
   *    .addEnvironmentVariable('MY_ENV_VAR', {value: 'arn:of:secret, type: BuildEnvironmentVariableType.SECRETS_MANAGER});
   * ```
   */
  addEnv(name: string, envVar: BuildEnvironmentVariable): SimpleCodebuildProject {
    this._envVariables[name] = envVar;
    return this;
  }

  /**
   * The name of the codebuild project
   * @param projectName - a valid name string
   */
  projectName(projectName: string): SimpleCodebuildProject {
    this._projectName = projectName;
    return this;
  }

  /**
   * The description of the codebuild project
   * @param projectDescription - a valid description string
   */
  projectDescription(projectDescription: string): SimpleCodebuildProject {
    this._projectDescription = projectDescription;
    return this;
  }

  /**
   * The compute type to use
   * @see https://docs.aws.amazon.com/codebuild/latest/userguide/build-env-ref-compute-types.html
   * @param computeType
   */
  computeType(computeType: ComputeType): SimpleCodebuildProject {
    this._computType = computeType;
    return this;
  }


  /**
   * The build image to use
   * @see https://docs.aws.amazon.com/codebuild/latest/userguide/build-env-ref-available.html
   * @see https://docs.aws.amazon.com/cdk/api/v1/docs/@aws-cdk_aws-codebuild.IBuildImage.html
   * @param buildImage
   */
  buildImage(buildImage: IBuildImage): SimpleCodebuildProject {
    this._buildImage = buildImage;
    return this;
  }

  /**
   * The build image to use
   * @param ecrRepoName - the ecr repository name
   * @param imageTag - the image tag
   */
  ecrBuildImage(ecrRepoName: string, imageTag: string): SimpleCodebuildProject {
    let repo = Repository.fromRepositoryName(this.scope, 'ClaimsCodeBuildBaseImageRepository', ecrRepoName);
    return this.buildImage(LinuxBuildImage.fromEcrRepository(repo, imageTag));
  }


  /**
   * The vpc network interfaces to add to the codebuild
   * @see https://docs.aws.amazon.com/cdk/api/v1/docs/aws-codebuild-readme.html#definition-of-vpc-configuration-in-codebuild-project
   * @param vpcId
   */
  inVpc(vpcId: string): SimpleCodebuildProject {
    this._vpcId = vpcId;
    return this;
  }

  /**
   * Set privileged mode of execution. Usually needed if this project builds Docker images,
   * and the build environment image you chose is not provided by CodeBuild with Docker support.
   * By default, Docker containers do not allow access to any devices.
   * Privileged mode grants a build project's Docker container access to all devices
   * https://docs.aws.amazon.com/codebuild/latest/userguide/change-project-console.html#change-project-console-environment
   * @param p - true/false
   */
  privileged(p: boolean): SimpleCodebuildProject {
    this._privileged = p;
    return this;
  }

  /**
   * If set, will skip artifact creation
   * @param skip
   */
  skipArtifacts(skip:boolean): SimpleCodebuildProject {
    this._skipArtifacts = skip;
    return this;
  }

  /**
   * The build spec file path
   * @param buildSpecPath - relative location of the build spec file
   */
  buildSpecPath(buildSpecPath: string): SimpleCodebuildProject {
    this._buildSpecPath = buildSpecPath;
    return this;
  }

  /**
   * The github or enterprise github repository url
   * @param gitRepoUrl
   */
  gitRepoUrl(gitRepoUrl: string): SimpleCodebuildProject {
    this._gitRepoUrl = gitRepoUrl;
    return this;
  }

  /**
   * The main branch of the github project.
   * @param branch
   */
  gitBaseBranch(branch: string): SimpleCodebuildProject {
    this._gitBaseBranch = branch;
    return this;
  }

  /**
   * Triggers build on push to specified branches
   * @param branches
   */
  triggerOnPushToBranches(branches:string[]): SimpleCodebuildProject {
    this._triggerOnPushToBranches.push(...branches);
    return this;
  }
  /**
   * The Github events that can trigger this build.
   * @param event
   */
  triggerBuildOnGitEvent(event: GitEvent): SimpleCodebuildProject {
    this._triggerOnGitEvent = event;
    return this;
  }

  /**
   * The cron schedule on which this build gets triggerd.
   * @param schedule
   */
  triggerBuildOnSchedule(schedule: Schedule): SimpleCodebuildProject {
    this._triggerOnSchedule = schedule;
    return this;
  }

  /**
   * The name of the bucket to store the artifacts.
   * By default the buckets will get stored in `<project-name>-artifacts` bucket.
   * This function can be used to ovrride the default behavior.
   * @param artifactBucket - a valid existing Bucket reference or bucket name to use.
   */
  artifactBucket(artifactBucket: IBucket | string): SimpleCodebuildProject {
    this._artifactBucket = artifactBucket;
    return this;
  }

  /**
   * Filter builds to only run for specific GitHub user IDs
   * @param ids array of GitHub user IDs (can be numeric or string)
   */
  filterActorAccountIds(ids: (string | number)[]): SimpleCodebuildProject {
    this._trustedActorAccountIds = ids.map(id => id.toString());
    return this;
  }

  /**
   * Filter webhook events by GitHub user IDs
   * @param userIds - array of GitHub user IDs (not usernames, but id values)
   */
  filterByGithubUserIds(userIds: number[]): SimpleCodebuildProject {
    this._githubUserIds = userIds;
    return this;
  }

  public overrideProjectProps(props: ProjectProps): SimpleCodebuildProject {
    let projectName = this._projectName ? this._projectName : Utils.kebabCase(this.id);
    let description = this._projectDescription ? this._projectDescription : `Codebuild description for ${projectName}`;

    let defaults = {
      projectName,
      description,
      grantReportGroupPermissions: this._grantReportGroupPermissions, // default to true
    };

    // set the default environment if not provided.
    if (Utils.isEmpty(props.environment)) {
      // @ts-ignore
      defaults.environment = {
        buildImage: this._buildImage ? this._buildImage : LinuxBuildImage.STANDARD_6_0, // default to Amazon Linux 6.0
        privileged: this._privileged,
        computeType: this._computType,
        environmentVariables: this._envVariables,
      };
    }

    // add default logging if not provided
    if (Utils.isEmpty(props.logging)) {
      // @ts-ignore
      defaults.logging = {
        cloudWatch: {
          logGroup: new LogGroup(this, 'ProjectLogGroup', {
            logGroupName: `/aws/codebuild/${Utils.kebabCase(projectName)}`,
            retention: RetentionDays.THIRTEEN_MONTHS,
          }),
        },
      };
    }

    // create source if not provided in props
    if (Utils.isEmpty(props.source)) {
      // @ts-ignore
      defaults.source = this.createSource(this._gitRepoUrl as string,
        this._gitBaseBranch,
        this._triggerOnGitEvent,
        this._triggerOnPushToBranches);
    }

    // create artifact bucket if one was not provided
    if (!this._skipArtifacts && Utils.isEmpty(props.artifacts)) {
      // @ts-ignore
      defaults.artifacts = this.createArtifacts(this._artifactBucket ?? `${this._projectName}-artifacts`);
    }

    // create the build spec if one was not provided
    if (Utils.isEmpty(props.buildSpec) && !Utils.isEmpty(this._buildSpecPath)) {
      // @ts-ignore
      defaults.buildSpec = this.createBuildSpec(this._buildSpecPath as string);
    }

    // create vpc interface if needed
    if (!Utils.isEmpty(this._vpcId)) {
      // @ts-ignore
      defaults.vpc = Vpc.fromLookup(this, 'VPC', { vpcId: this._vpcId });
    }

    this._props = Object.assign({}, defaults, props);

    return this;
  }


  assemble(defaultProps?:ProjectProps): SimpleCodebuildProject {
    // create the default project properties
    this.overrideProjectProps(defaultProps??{});

    // create a codebuild project
    let project = new Project(this.scope, 'Project', this._props);

    // run above project on a schedule ?
    if (this._triggerOnSchedule) {
      new Rule(this.scope, 'ScheduleRule', {
        schedule: this._triggerOnSchedule,
        targets: [new CodeBuildProject(project)],
      });
    }
    this._project = project;

    Utils.suppressNagRule(this._project, 'AwsSolutions-CB4', 'Artifacts produced by this project are encrypted using `aws/s3` key, and also at rest by S3.');
    Utils.suppressNagRule(this._project, 'AwsSolutions-IAM5', 'There is an artifact bucket per project. The wild card IAM policies are scoped to this project and only used to manage artifacts produced by the project.');

    return this;
  }

  /**
   * Create an S3 bucket for storing artifacts produced by the codebuild project
   * @param bucketName - the s3 bucket
   * @private
   */
  private createBucket(bucketName: string): IBucket {
    return new SecureBucket(this, 'ProjectArtifactBucket')
      .bucketName(bucketName)
      .objectsExpireInDays(90)
      .assemble()
      .bucket as IBucket;
  }

  /**
   * Creates an S3 artifact store for storing the objects produced by the codebuild project
   * @param artifactBucket - a bucket object or bucket name
   * @private
   */
  private createArtifacts(artifactBucket: IBucket | string): Artifacts {
    let theBucket: IBucket = (typeof artifactBucket === 'string') ? this.createBucket(artifactBucket) : artifactBucket;
    return Artifacts.s3({
      bucket: theBucket,
      includeBuildId: true,
      packageZip: true,
      path: this._projectName,
    });
  }

  /**
   * Creates a Github or Enterprise Githb repo source object
   * @param repoUrl - the url of the repo
   * @param base - the main or base branch used by the repo
   * @param gitEvent - the github events that can trigger builds
   * @param branches - the branches to trigger on push
   * @private
   */
  private createSource(repoUrl: string, base?: string, gitEvent?: GitEvent, branches?:Array<string>): Source {
    let webhook = gitEvent && true;
    let repoDetails = Utils.parseGithubUrl(repoUrl);
    let webhookFilter = this.createWebHookFilters(base, gitEvent, branches, this._githubUserIds);

    if (repoDetails.enterprise == true) {
      return Source.gitHubEnterprise({
        httpsCloneUrl: repoUrl,
        webhook,
        webhookFilters: webhookFilter,
      });
    }

    return Source.gitHub({
      owner: repoDetails.owner,
      repo: repoDetails.repo,
      webhook,
      webhookFilters: webhookFilter,
    });

  }

  /**
   * Creates a webhook filter object
   * @param base - the base branch
   * @param gitEvent - the github event
   * @param branches - the branches to trigger on push
   * @param githubUserIds - optional GitHub user IDs to filter events by
   * @private
   */
  private createWebHookFilters(base?: string, gitEvent?: GitEvent, branches?:Array<string>, githubUserIds?: number[]): FilterGroup[] | undefined {
    let fgList: FilterGroup[] = [];

    if (!gitEvent) return undefined;

    // Helper function to create event filters for each user ID
    const createUserFilters = (baseEvents: EventAction[], isForBranch: boolean = false, branchName?: string) => {
      if (githubUserIds && githubUserIds.length > 0) {
        // Create a separate filter group for each user (OR condition)
        githubUserIds.forEach(userId => {
          let fg = FilterGroup.inEventOf(...baseEvents);
          if (base && !isForBranch) {
            fg = fg.andBaseBranchIs(base);
          }
          if (isForBranch && branchName) {
            fg = fg.andHeadRefIs(branchName);
          }
          fg = fg.andActorAccountIs(userId.toString());
          fgList.push(fg);
        });
      } else {
        // No user filtering
        let fg = FilterGroup.inEventOf(...baseEvents);
        if (base && !isForBranch) {
          fg = fg.andBaseBranchIs(base);
        }
        if (isForBranch && branchName) {
          fg = fg.andHeadRefIs(branchName);
        }
        fgList.push(fg);
      }
    };

    if (gitEvent == GitEvent.PULL_REQUEST) {
      createUserFilters([
        EventAction.PULL_REQUEST_CREATED,
        EventAction.PULL_REQUEST_UPDATED,
        EventAction.PULL_REQUEST_REOPENED
      ]);
    }

    if (gitEvent == GitEvent.PULL_REQUEST_MERGED) {
      createUserFilters([EventAction.PULL_REQUEST_MERGED]);
    }

    if (gitEvent == GitEvent.PUSH) {
      createUserFilters([EventAction.PUSH]);
    }

    if (gitEvent == GitEvent.ALL) {
      createUserFilters([
        EventAction.PUSH,
        EventAction.PULL_REQUEST_CREATED,
        EventAction.PULL_REQUEST_UPDATED,
        EventAction.PULL_REQUEST_REOPENED,
        EventAction.PULL_REQUEST_MERGED
      ]);
    }

    // Handle branch-specific filters
    branches?.forEach(branch => {
      createUserFilters([EventAction.PUSH], true, branch);
    });

    return fgList;
  }

  /**
   * Loads the build spec associated with the given codebuild project
   * @param buildSpecPath - location of the build spec file.
   * @private
   */
  private createBuildSpec(buildSpecPath: string): BuildSpec {
    return BuildSpec.fromSourceFilename(buildSpecPath);
  }

}
