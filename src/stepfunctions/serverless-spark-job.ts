
import { Arn, ArnFormat, RemovalPolicy, Stack, Token } from 'aws-cdk-lib';
import { IRole, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Bucket, IBucket } from 'aws-cdk-lib/aws-s3';
import {
  Choice,
  Condition,
  DefinitionBody,
  Errors,
  Fail,
  IntegrationPattern,
  LogLevel,
  Pass,
  StateMachine,
  Succeed,
} from 'aws-cdk-lib/aws-stepfunctions';
import { StateMachineProps } from 'aws-cdk-lib/aws-stepfunctions/lib/state-machine';
import { ApplicationConfiguration, CallAwsService } from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { Construct } from 'constructs';
import { EzConstruct } from '../ez-construct';
import { Utils } from '../lib/utils';

export class StepFunctionBase extends EzConstruct {

  protected _account: string;
  protected _region: string;

  protected readonly scope: Construct;
  private readonly _id: string;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.scope = scope;
    this._id = id;
    this._account = Stack.of(scope).account;
    this._region = Stack.of(scope).region;
  }
}
/**
 * A standard spark submit job template.
 */
export interface StandardSparkSubmitJobTemplate {
  /**
   * The name of the job.*required*
   */
  readonly jobName: string;
  /**
   * The S3 URL of the spark application's main file in Amazon S3.
   * A jar file for Scala and Java Spark applications and a Python file for pySpark applications.
   */
  readonly entryPoint: string;
  /**
   * The name of the application's main class,only applicable for Java/Scala Spark applications.
   */
  readonly mainClass?: string;
  /**
   * The arguments to pass to the application.
   */
  readonly sparkSubmitParameters?: string;
  /**
   * Any version of overrides to use while provisioning EMR job.
   */
  readonly applicationConfiguration?: ApplicationConfiguration[];

  /**
   * True if monitoring must be enabled. Defaults to true.
   */
  readonly enableMonitoring?: boolean;

}


/**
 * This construct will create a Step function workflow that can submit spark job.
 * If you utilize the @see SandardSparkSubmitJobTemplate, the workflow generated will consist of a single spark job.
 * If you need a much elaborate workflow, you can provide a string version of the state definition, while initializing the construct.
 *
 * @example
 *  There are many instances where an ETL job may only have a single spark job. In such cases, you can use the @see StandardSparkSubmitJobTemplate.
 *  The `usingDefinition` method will take care of capturing variables, like `entryPoint`, `mainClass` etc .
 *  By default the step function during execution utilize those variable values as default.
 *  It is quite common that the JAR files used for the spark job may be different. To address that, 'EntryPoint` and `SparkSubmitParameters` variables are externalized and can be overriden during execution.
 * ```typescript
 * new SimpleServerlessSparkJob(mystack, 'SingleFly')
 *  .name('MyTestETL')
 *  .jobRole('delegatedadmin/developer/blames-emr-serverless-job-role')
 *  .applicationId('12345676')
 *  .logBucket('mylogbucket-name')
 *  .usingDefinition({
 *         jobName: 'mytestjob',
 *         entryPoint: 's3://aws-cms-amg-qpp-costscoring-artifact-dev-222224444433-us-east-1/biju_test_files/myspark-assembly.jar',
 *         mainClass: 'serverless.SimpleSparkApp',
 *         enableMonitoring: true,
 *    })
 *  .assemble();
 *  ```
 * Having seen the above simple example, let us look at a more elaborate example, where the step function workflow is complex.
 * It is possible to author the step function workflow JSON file and provide it as a string to the `usingDefinition` method.
 * ```typescript
 *  new SimpleServerlessSparkJob(mystackObj, 'MultiFly')
 *  .name('MyAwesomeETL')
 *  .jobRole('delegatedadmin/developer/blames-emr-serverless-job-role')
 *  .applicationId('12345676')
 *  .logBucket('mylogbucket-name')
 *  .usingDefinition("{...json step function string.... }")
 *  .assemble();
 * ```
 * If we have to read differnent input parameters for the spark job, we can have variables that extract values from the context.
 * ```typescript
 * new SimpleServerlessSparkJob(mystackObj, 'MultiFly')
 *  .name('MyAwesomeETL')
 *  .jobRole('delegatedadmin/developer/blames-emr-serverless-job-role')
 *  .applicationId('12345676')
 *  .logBucket('mylogbucket-name')
 *  .usingDefinition("{...json step function string.... }")
 *  .withDefaultInputs({"some":"thing", "other": "thing"})
 *  .assemble();
 *  ```
 *
 */
export class SimpleServerlessSparkJob extends StepFunctionBase {

  private _logBucket?: IBucket;
  private _jobRole: IRole;
  private _jobRoleArn: string;

  private _stateDefinition: string;
  private _singleSparkJobTemplate?: StandardSparkSubmitJobTemplate;

  private _name: string;

  private _applicationId: string;
  private _applicationArn: string;

  private _stateMachine: StateMachine;
  private _stateMachineRole: IRole;

  private _tracingEnabled: boolean = true;

  private _defaultInputs: any;

  constructor(scope: Construct, id: string) {
    super(scope, id);
  }

  /**
   * The state machine instance created by this construct.
   * @returns {StateMachine}
   */
  get stateMachine(): StateMachine {
    return this._stateMachine;
  }

  /**
   * The modified state definitoin string, if a string version of state definiton was utilized.
   * @returns {string}
   */
  get stateDefinition(): string {
    return this._stateDefinition;
  }

  /**
   * Sets the name of the step function workflow.
   * @param name
   */
  name(name: string): SimpleServerlessSparkJob {
    this._name = name;
    return this;
  }

  /**
   * The workflow deriniton approach to use. If a string is provided, it must be a valid step funtion workflow definition JSON string.
   * If an object is provided, it must be a valid StandardSparkSubmitJobTemplate object.
   * In the template, spark submit parameters are optional and mainClass is only required for Scala spark jobs.
   * @param template
   */
  usingDefinition(template: StandardSparkSubmitJobTemplate | string): SimpleServerlessSparkJob {

    if (typeof template === 'string') {
      this._stateDefinition = template;
    } else {
      this._singleSparkJobTemplate = template;
    }

    return this;
  }

  /**
   * Default inputs of the spark jobs. Example:-
   *  ```
   *  .withDefaultInputs({
   *      "SparkSubmitParameters": {
   *        "--conf spark.executor.memory=2g",
   *        "--conf spark.executor.cores=2"
   *      },
   *      "greetings": "Good morning",
   *      "personal": {
   *        "name": "John Doe",
   *        "age": 30
   *      }
   *   })
   *  ```
   * @param params
   */
  withDefaultInputs(params: any): SimpleServerlessSparkJob {
    this._defaultInputs = params;
    return this;
  }

  /**
   * The role the spark job will assume while executing jobs in EMR.
   * @param name - a qualified name including the path. e.g. `path/to/roleName`
   */
  jobRole(name: string): SimpleServerlessSparkJob {
    this._jobRole = Role.fromRoleName(this.scope, 'JobRole', name);
    this.regeneateJobRoleArn();
    return this;
  }

  /**
   * The serverless application ID, and to that application the jobs will be submitted.
   * @param applicaitonId
   */
  applicationId(applicaitonId: string): SimpleServerlessSparkJob {
    this._applicationId = applicaitonId;
    this.regenerateApplicationArn();
    return this;
  }

  /**
   * A bucket to store the logs producee by the Spark jobs.
   * @param bucket
   */
  logBucket(bucket: string | IBucket): SimpleServerlessSparkJob {

    if (typeof bucket === 'string') {
      this._logBucket = Bucket.fromBucketName(this.scope, 'LoggingBucket',
        Utils.appendIfNecessary(bucket, this._account, this._region));
      return this;
    }

    this._logBucket = bucket;
    return this;
  }

  /**
   * Determines if tracing the stepfunction workflow is enabled. Defaults to false.
   * @param enalbe
   */

  tracingEnabled(enalbe: boolean): SimpleServerlessSparkJob {
    this._tracingEnabled = enalbe;
    return this;
  }

  private regeneateJobRoleArn(): void {
    this._jobRoleArn = Token.asString(Stack.of(this.scope).formatArn({
      partition: 'aws',
      service: 'iam',
      resource: 'role',
      region: '',
      resourceName: Arn.extractResourceName(this._jobRole.roleArn, 'role'),
      arnFormat: ArnFormat.SLASH_RESOURCE_NAME,
    }));

  }

  private regenerateApplicationArn(): void {
    this._applicationArn = Token.asString(Stack.of(this.scope).formatArn({
      service: 'emr-serverless',
      resource: 'applications',
      resourceName: this._applicationId,
      arnFormat: ArnFormat.SLASH_RESOURCE_SLASH_RESOURCE_NAME,
    }));
  }

  private mergeConfigOverrides(jobName: string, overrides: Object): Object {
    let defaults: any = {
      MonitoringConfiguration: {
        S3MonitoringConfiguration: {
          LogUri: this._logBucket?.s3UrlForObject(`${this._name}/${jobName}`),
        },
        ManagedPersistenceMonitoringConfiguration: {
          Enabled: true,
        },
      },
    };
    if (this._singleSparkJobTemplate?.applicationConfiguration) {
      defaults.ApplicationConfiguration = this._singleSparkJobTemplate.applicationConfiguration;
    }

    return Object.assign({}, defaults, overrides);
  }

  /**
   * Modifies the supplied state definition string version of workflow defintion to include logging and tracing.
   * @param stateDef - the state definition string
   * @private
   */
  private modifyStateDefinition(stateDef:string): string {
    let definition = JSON.parse(stateDef);
    if (this._defaultInputs) {
      definition.States.DefineDefaults = {
        Type: 'Pass',
        ResultPath: '$.inputDefaults',
        Next: 'ApplyDefaults',
        Parameters: {
          ...this._defaultInputs,
        },
      };
      definition.States.ApplyDefaults = {
        Type: 'Pass',
        Next: definition.StartAt,
        ResultPath: '$.withDefaults',
        OutputPath: '$.withDefaults.args',
        Parameters: {
          'args.$': 'States.JsonMerge($.inputDefaults, $$.Execution.Input, false)',
        },
      };
      definition.StartAt = 'DefineDefaults';

    }

    // iterate through the States object within the definition as key/value pairs
    Object.entries(definition.States).forEach(([key, value]) => {
      if (value.Resource == 'arn:aws:states:::aws-sdk:emrserverless:startJobRun.waitForTaskToken') {
        let params = value.Parameters;
        params.ExecutionRoleArn = this._jobRoleArn;
        params.ApplicationId = this._applicationId;
        params.Name = params.Name || `${Utils.camelCase(this._name)}SparkJob`;
        let entryPointArguments = params.JobDriver.SparkSubmit['EntryPointArguments.$'];
        if (!Utils.contains(entryPointArguments, 'States.Array($$.Task.Token)')) {
          params.JobDriver.SparkSubmit['EntryPointArguments.$'] = 'States.Array($$.Task.Token)';
        }
        params.ConfigurationOverrides = this.mergeConfigOverrides(params.Name, params.ConfigurationOverrides);
      }
    });

    return JSON.stringify(definition);
  }

  /**
   * Will create a state definition object based on the supplied StandardSparkSubmitJobTemplate object.
   * @private
   */
  private createStateDefinition(): DefinitionBody {

    let sparkSubmitParams = this._singleSparkJobTemplate?.sparkSubmitParameters;
    if (this._singleSparkJobTemplate?.mainClass) {
      sparkSubmitParams = `--main ${this._singleSparkJobTemplate.mainClass} ${sparkSubmitParams}`;
    }

    this._defaultInputs = this._defaultInputs || {};
    this._defaultInputs.EntryPoint = this._singleSparkJobTemplate?.entryPoint;
    this._defaultInputs.SparkSubmitParameters = sparkSubmitParams;

    let loadDefaultsState = new Pass(this.scope, 'LoadDefaults', {
      resultPath: '$.inputDefaults',
      parameters: {
        ...this._defaultInputs,
      },
    });

    let applyDefaultsState = new Pass(this.scope, 'ApplyDefaults', {
      resultPath: '$.withDefaults',
      outputPath: '$.withDefaults.args',
      parameters: {
        'args.$': 'States.JsonMerge($.inputDefaults, $$.Execution.Input, false)',
      },
    });

    let jobName = `${Utils.camelCase(this._name)}SparkJob`;

    const successState = new Succeed(this, 'Success');

    const failState = new Fail(this, 'Fail', {
      error: `The job ${jobName} failed.`,
    });

    const runJobState = new CallAwsService(this, 'RunSparkJob', {
      service: 'emrserverless',
      action: 'startJobRun',
      integrationPattern: IntegrationPattern.WAIT_FOR_TASK_TOKEN,
      iamResources: [this._applicationArn],
      resultPath: '$.JobStatus',
      parameters: {
        'ApplicationId': this._applicationId,
        'ClientToken.$': 'States.UUID()',
        'Name': jobName,
        'ExecutionRoleArn': this._jobRoleArn,
        'JobDriver': {
          SparkSubmit: {
            'EntryPoint': '$.EntryPoint',
            'EntryPointArguments.$': 'States.Array($$.Task.Token)',
            'SparkSubmitParameters': '$.SparkSubmitParameters',
          },
        },
        'ConfigurationOverrides': this.mergeConfigOverrides(jobName, {}),
      },
    }).addCatch(failState, {
      errors: [Errors.ALL],
    });


    return DefinitionBody.fromChainable(loadDefaultsState
      .next(applyDefaultsState)
      .next(runJobState)
      .next(
        new Choice(this, 'Job Complete ?')
          .when(Condition.stringEquals('$.status', 'SUCCEEDED'), successState)
          .otherwise(failState),
      ));

  }

  /**
   * Assembles the state machine for the workflow.
   * @param stateMachineProps
   */
  assemble(stateMachineProps?: StateMachineProps): SimpleServerlessSparkJob {

    this._stateMachineRole = new Role(this.scope, 'StateMachineRole', {
      roleName: `${this._name}StateMachineRole`,
      assumedBy: new ServicePrincipal('states.amazonaws.com'),
    });

    let destination = new LogGroup(this.scope, 'LogGroup', {
      removalPolicy: RemovalPolicy.DESTROY,
      retention: RetentionDays.THREE_MONTHS,
      logGroupName: `${this._name}LogGroup`,
    });

    let definitionBody = undefined;

    if (this._stateDefinition) {
      this._stateDefinition = this.modifyStateDefinition(this._stateDefinition);
      definitionBody = DefinitionBody.fromString(this._stateDefinition);
    } else {
      definitionBody = this.createStateDefinition();
    }

    let defaultStateMachineProps: StateMachineProps = {
      definitionBody: definitionBody,
      stateMachineName: this._name,
      role: this._stateMachineRole,
      tracingEnabled: this._tracingEnabled,
      logs: {
        level: LogLevel.ALL,
        includeExecutionData: false,
        destination: destination,
      },
    };

    let props:StateMachineProps = Object.assign({}, defaultStateMachineProps, stateMachineProps);
    this._stateMachine = this._stateMachine = new StateMachine(this.scope, 'StateMachine', props);

    // allow stepfunctions to invoke spark jobs in emr
    this._stateMachine.addToRolePolicy(new PolicyStatement({
      actions: ['emr-serverless:StartJobRun'],
      resources: [this._applicationArn, `${this._applicationArn}/jobruns/*`],
    }));

    // ensure that passRole permission is granted
    this._jobRole.grantPassRole(this._stateMachine.role);

    return this;
  }


}