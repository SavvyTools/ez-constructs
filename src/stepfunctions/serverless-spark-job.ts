import { Arn, ArnFormat, RemovalPolicy, Stack, Token } from 'aws-cdk-lib';
import { IRole, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Code, Runtime, SingletonFunction } from 'aws-cdk-lib/aws-lambda';
import { ILogGroup, LogGroup, LogRetention, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Bucket, IBucket } from 'aws-cdk-lib/aws-s3';
import {
  Choice,
  Condition,
  DefinitionBody,
  Errors,
  Fail,
  IChainable,
  IntegrationPattern,
  LogLevel,
  Pass,
  StateMachine,
  Succeed,
} from 'aws-cdk-lib/aws-stepfunctions';
import { StateMachineProps } from 'aws-cdk-lib/aws-stepfunctions/lib/state-machine';
import { ApplicationConfiguration, CallAwsService, LambdaInvoke } from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { Construct } from 'constructs';
import { EzConstruct } from '../ez-construct';
import { Utils } from '../lib/utils';

export class SimpleStepFunction extends EzConstruct {


  /** @internal */ _account: string = '';
  /** @internal */ _region: string = '';
  /** @internal */ _name: string = '';

  /** @internal */ _policies: PolicyStatement[] = [];
  /** @internal */ _stateMachine?: StateMachine;
  /** @internal */ _stateMachineRole?: IRole;
  /** @internal */ _stateDefinition?: IChainable | string;
  /** @internal */ _stateDefinitionBody?: DefinitionBody;
  /** @internal */ _defaultInputs: any = {};
  /** @internal */ _grantee?: IRole;
  /** @internal */ _logGroupName: string = '';


  private readonly _scope: Construct;
  private readonly _id: string;


  constructor(scope: Construct, id: string, stepFunctionName: string) {
    super(scope, id);

    this._scope = scope;
    this._id = id;
    this._name = stepFunctionName;
    this._account = Stack.of(scope).account;
    this._region = Stack.of(scope).region;
  }

  get account(): string {
    return this._account;
  }

  get region(): string {
    return this._region;
  }

  get scope(): Construct {
    return this._scope;
  }

  get id(): string {
    return this._id;
  }

  get defaultInputs(): any {
    return this._defaultInputs;
  }

  /**
   * The state machine instance created by this construct.
   * @returns {StateMachine}
   */
  get stateMachine(): StateMachine {
    return this._stateMachine!;
  }

  get policies(): PolicyStatement[] {
    return this._policies;
  }

  get stateMachineRole(): IRole {
    return this._stateMachineRole!;
  }

  /**
   * Returns the state definition as a string if the original state definition used was string.
   * Otherwise returns empty string.
   */
  get stateDefinitionAsString(): string {
    if (typeof this._stateDefinition === 'string') {
      return this._stateDefinition;
    }
    return '';
  }

  /**
   * Sets the state definition, and if type of the value passed is a string,
   * will also set the stateDefinition when it is a string.
   * @param value
   */
  set stateDefinition(value: IChainable | string) {
    if (typeof value === 'string') {
      this._stateDefinition = value;
      this._stateDefinitionBody = DefinitionBody.fromString(value);
    } else {
      this._stateDefinitionBody = DefinitionBody.fromChainable(value);
    }
  }


  /**
   * Sets the logGroupName
   * @param value - name of the log group
   */
  public logGroupName(value: string): SimpleStepFunction {
    this._logGroupName = value;
    return this;
  }

  /**
   * Returns the state definition body object
   */
  get stateDefinitionBody(): DefinitionBody {
    return this._stateDefinitionBody!;
  }

  /**
   * Creates state machine from the given props
   * @param stateMachineProps
   */
  public createStateMachine(stateMachineProps: StateMachineProps): StateMachine {
    let stateMachine = new StateMachine(this.scope, 'StateMachine', stateMachineProps);
    this.policies.forEach(p => stateMachine.addToRolePolicy(p));
    this._grantee?.grantPassRole(stateMachine.role);
    return stateMachine;
  }

  /**
   * Will add default permisisons to the step function role
   */
  generateDefaultStateMachinePermissions(): void {
    // do nothing
  }


  public addPolicy(policy: PolicyStatement): SimpleStepFunction {
    this._policies.push(policy);
    return this;
  }

  usingStringDefinition(stateDefinition: string): SimpleStepFunction {
    this.stateDefinition = this.modifyStateDefinition(stateDefinition);
    return this;
  }

  public usingChainableDefinition(stateDefinition: IChainable): SimpleStepFunction {
    this.stateDefinition = stateDefinition;
    return this;
  }

  /**
   * Modifies the supplied state definition string version of workflow defintion to include logging and tracing.
   * @param stateDef - the state definition string
   * @private
   */
  modifyStateDefinition(stateDef:string): string {
    let definition = JSON.parse(stateDef);
    if (!Utils.isEmpty(this.defaultInputs)) {
      definition.States.DefineDefaults = {
        Type: 'Pass',
        ResultPath: '$.inputDefaults',
        Next: 'ApplyDefaults',
        Parameters: {
          ...this.defaultInputs,
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
    return JSON.stringify(definition);
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
  withDefaultInputs(params: any): SimpleStepFunction {
    this._defaultInputs = params;
    return this;
  }

  /**
   * Grants pass role permissions to the state machine role
   */
  public grantPassRole(role: IRole): SimpleStepFunction {
    this._grantee = role;
    return this;
  }

  /**
   * Assembles the state machine.
   * @param stateMachineProps
   */
  assemble(stateMachineProps?: StateMachineProps): SimpleStepFunction {
    this._stateMachineRole = this.createStateMachineRole(this._name);
    let destination = this.createStateMachineCloudWatchLogGroup();

    let defaults = this.createDefaultStateMachineProps(
      this._name,
      this.stateMachineRole,
      this.stateDefinitionBody,
      destination,
    );

    this.generateDefaultStateMachinePermissions();
    let props = Utils.merge(defaults, stateMachineProps);
    this._stateMachine = this.createStateMachine(props);
    return this;
  }


  /**
   * creates state machine role
   */
  public createStateMachineRole(stateMachineName: string): IRole {
    return new Role(this.scope, 'StateMachineRole', {
      roleName: `${stateMachineName}StateMachineRole`,
      assumedBy: new ServicePrincipal('states.amazonaws.com'),
    });
  }

  /**
   * creates bucket to store state machine logs
   */
  public createStateMachineCloudWatchLogGroup(): ILogGroup {
    if (Utils.isEmpty(this._logGroupName)) {
      this._logGroupName = '/aws/vendedlogs';
      new LogRetention(this.scope, 'LogGroupRetention', {
        retention: RetentionDays.THREE_MONTHS,
        removalPolicy: RemovalPolicy.DESTROY,
        logGroupName: this._logGroupName,
      });
    }

    return LogGroup.fromLogGroupName(this.scope, 'LogGroup', this._logGroupName);


  }

  public createDefaultStateMachineProps(stateMachineName: string, stateMachineRole: IRole,
    definitionBody: DefinitionBody, logGroup: ILogGroup): StateMachineProps {
    return {
      definitionBody: definitionBody,
      stateMachineName: stateMachineName,
      role: stateMachineRole,
      tracingEnabled: false,
      logs: {
        level: LogLevel.ALL,
        includeExecutionData: false,
        destination: logGroup,
      },
    };
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
   * The names of the arguments to pass to the application.
   * The actual argument value should be specified during step funciton execution time.
   */
  readonly entryPointArgumentNames?: string[];
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
 * new SimpleServerlessSparkJob(mystack, 'SingleFly', 'MyTestETL)
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
 *  new SimpleServerlessSparkJob(mystackObj, 'MultiFly', 'MyAwesomeETL)
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
export class SimpleServerlessSparkJob extends SimpleStepFunction {
  private _validatorLambdaFn?: SingletonFunction;
  private _replacerLambdaFn?: SingletonFunction;

  private _logBucket?: IBucket;
  private _jobRole?: IRole;
  private _jobRoleArn?: string;

  private _singleSparkJobTemplate?: StandardSparkSubmitJobTemplate;

  private _applicationId?: string | undefined ;
  private _applicationArn?: string | undefined ;

  constructor(scope: Construct, id: string, stepFunctionName: string) {
    super(scope, id, stepFunctionName);
  }


  get validatorLambdaFn(): SingletonFunction {
    return <SingletonFunction> this._validatorLambdaFn;
  }

  get replacerLambdaFn(): SingletonFunction {
    return <SingletonFunction> this._replacerLambdaFn;
  }

  /**
   * The role the spark job will assume while executing jobs in EMR.
   * @param name - a qualified name including the path. e.g. `path/to/roleName`
   */
  jobRole(name: string): SimpleServerlessSparkJob {
    this._jobRole = Role.fromRoleName(this.scope, 'JobRole', name);
    this.regeneateJobRoleArn();
    this.grantPassRole(this._jobRole);
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
        Utils.appendIfNecessary(bucket, this.account, this.region));
      return this;
    }

    this._logBucket = bucket;
    return this;
  }

  private regeneateJobRoleArn(): void {
    this._jobRoleArn = Token.asString(Stack.of(this.scope).formatArn({
      partition: 'aws',
      service: 'iam',
      resource: 'role',
      region: '',
      resourceName: Arn.extractResourceName(this._jobRole?.roleArn!, 'role'),
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
  private transformApplicationConfiguration(ac: ApplicationConfiguration): Object {
    return {
      Classification: ac.classification.classificationStatement,
      Properties: ac.properties,
      Configurations: ac.nestedConfig ? ac.nestedConfig.map(o => this.transformApplicationConfiguration(o)) : undefined,
    };
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
      defaults.ApplicationConfiguration = this._singleSparkJobTemplate.applicationConfiguration.map(ac => this.transformApplicationConfiguration(ac));
    }

    return Object.assign({}, defaults, overrides);
  }

  /**
   * Modifies the supplied state definition string version of workflow defintion to include logging and tracing.
   * @param aDef - the state definition string
   * @private
   */
  override modifyStateDefinition(aDef:string): string {

    let stateDef = super.modifyStateDefinition(aDef);
    let definition = JSON.parse(stateDef);

    // iterate through the States object within the definition as key/value pairs
    Object.values(definition.States).forEach((v) => {
      let value = v as any;
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
  private createStateDefinition(): IChainable {

    let sparkSubmitParams = this._singleSparkJobTemplate?.sparkSubmitParameters || '';
    if (this._singleSparkJobTemplate?.mainClass) {
      sparkSubmitParams = `--class ${this._singleSparkJobTemplate.mainClass} ${sparkSubmitParams}`;
    }

    this.defaultInputs.EntryPoint = this._singleSparkJobTemplate?.entryPoint;
    this.defaultInputs.entryPointArgumentNames = this._singleSparkJobTemplate?.entryPointArgumentNames;
    this.defaultInputs.SparkSubmitParameters = sparkSubmitParams;

    let loadDefaultsState = new Pass(this.scope, 'LoadDefaults', {
      resultPath: '$.inputDefaults',
      parameters: {
        ...this.defaultInputs,
      },
    });

    let applyDefaultsState = new Pass(this.scope, 'ApplyDefaults', {
      resultPath: '$.withDefaults',
      outputPath: '$.withDefaults.args',
      parameters: {
        'args.$': 'States.JsonMerge($.inputDefaults, $$.Execution.Input, false)',
      },
    });

    let entryPointArgsState = new Pass(this.scope, 'EntryArgs', {
      resultPath: '$.entryArgs',
      parameters: {
        args: `${Utils.join(this._singleSparkJobTemplate?.entryPointArgumentNames)}`,
      },
    });

    let jobName = `${Utils.camelCase(this._name)}SparkJob`;

    const successState = new Succeed(this, 'Success');

    const failState = new Fail(this, 'Fail', {
      error: `The job ${jobName} failed.`,
    });

    let argsLine = 'States.Array($$.Task.Token';
    this.defaultInputs.entryPointArgumentNames?.forEach((k:any) => {
      argsLine += `,'${k}',$['${k}']`;
    });
    argsLine += ')';

    const runJobState = new CallAwsService(this, 'RunSparkJob', {
      service: 'emrserverless',
      action: 'startJobRun',
      integrationPattern: IntegrationPattern.WAIT_FOR_TASK_TOKEN,
      iamResources: [this._applicationArn!],
      resultPath: '$.JobStatus',
      parameters: {
        'ApplicationId': this._applicationId,
        'ClientToken.$': 'States.UUID()',
        'Name': jobName,
        'ExecutionRoleArn': this._jobRoleArn,
        'JobDriver': {
          SparkSubmit: {
            'EntryPoint.$': '$.EntryPoint',
            'EntryPointArguments.$': argsLine,
            'SparkSubmitParameters.$': '$.SparkSubmitParameters',
          },
        },
        'ConfigurationOverrides': this.mergeConfigOverrides(jobName, {}),
      },
    }).addCatch(failState, {
      errors: [Errors.ALL],
    });

    let jobCompleteState = new Choice(this, 'Job Complete ?')
      .when(Condition.stringEquals('$.JobStatus.Status', 'Success'), successState)
      .otherwise(failState);

    let replacerFnState = new LambdaInvoke(this, 'ReplacerFnInvoke', {
      lambdaFunction: this.replacerLambdaFn,
      outputPath: '$.Payload',
    });

    // if validator singleton function present, add it to chain
    if (this.validatorLambdaFn) {
      let lambdaFnState = new LambdaInvoke(this, 'ValidatorFnInvoke', {
        lambdaFunction: this.validatorLambdaFn,
        resultPath: '$.validator',
        resultSelector: { 'result.$': '$.Payload' },
      });

      let entryValidState = new Choice(this, 'EntryArgs Valid ?')
        .when(Condition.stringEquals('$.validator.result.status', 'fail'), failState)
        .otherwise(runJobState)
        .afterwards();

      return loadDefaultsState
        .next(applyDefaultsState)
        .next(entryPointArgsState)
        .next(replacerFnState)
        .next(lambdaFnState)
        .next(entryValidState)
        .next(jobCompleteState);
    }

    return loadDefaultsState
      .next(applyDefaultsState)
      .next(entryPointArgsState)
      .next(replacerFnState)
      .next(runJobState)
      .next(jobCompleteState);

  }


  /**
   * Will create a state definition object based on the supplied StandardSparkSubmitJobTemplate object.
   * @param sparkJobTemplate
   */
  usingSparkJobTemplate(sparkJobTemplate: StandardSparkSubmitJobTemplate): SimpleServerlessSparkJob {
    this._singleSparkJobTemplate = sparkJobTemplate;
    return this;
  }


  /**
   * Will add default permisisons to the step function role
   */
  override generateDefaultStateMachinePermissions(): void {
    super.addPolicy(new PolicyStatement({
      actions: ['emr-serverless:StartJobRun'],
      resources: [this._applicationArn!, `${this._applicationArn!}/jobruns/*`],
    }));

  }

  /**
   * Will create replacements of text in %KEY%, with actual value of the KEY
   * @private
   */
  private createReplacementFn(): SingletonFunction {

    return new SingletonFunction(this, 'Replacer', {
      uuid: '86323b0e-2faf-5a68-a6c1-7da4b4e3c3e5',
      lambdaPurpose: 'replace',
      functionName: Utils.kebabCase(`${this._name}-Replacer`),
      runtime: Runtime.NODEJS_LATEST,
      handler: 'index.handler',
      code: Code.fromInline(`
        function isObject(obj) {
            return obj !== null && typeof obj === 'object';
        }
        
        function replaceValues(obj, data) {
            if (isObject(obj)) {
                const replacedObj = {};
                for (const key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        replacedObj[key] = replaceValues(obj[key], data);
                    }
                }
                return replacedObj;
            } else if (typeof obj === 'string') {
                return obj.replace(/%([^%]+)%/g, (match, key) => data[key] || match);
            } else {
                return obj;
            }
        }
        
        exports.handler = async (event) => {
            return replaceValues(event, event);
        };      
      `),
    });
  }

  /**
   * Will create the validator lambda function that can validate entrypoint args
   * @private
   */
  private createValidatorFn(): SingletonFunction {

    return new SingletonFunction(this, 'Validator', {
      uuid: '93243b0e-6fbf-4a68-a6c1-6da4b4e3c3e4',
      lambdaPurpose: 'validation',
      functionName: Utils.kebabCase(`${this._name}-EntryArgsValidator`),
      runtime: Runtime.NODEJS_LATEST,
      handler: 'index.handler',
      code: Code.fromInline(`
          exports.handler = async (event, context) => {
              console.log('Received event:', JSON.stringify(event, null, 2));
              let errors = [];
              let args = event['entryArgs']['args'];
              if (args) {
                  args.split(',').forEach(k=> {
                      let v = event[k];
                      if (!v) {
                          errors.push('Missing value for, ' + k);
                      }
                  });
              }
              
              return {
                  "status": errors.length > 0 ? "fail": "pass",
                  "errors": errors
              }
          };
      `),
    });
  }


  assemble(stateMachineProps?: StateMachineProps): SimpleStepFunction {
    if (this._singleSparkJobTemplate) {
      if (this._singleSparkJobTemplate.entryPointArgumentNames) {
        this._validatorLambdaFn = this.createValidatorFn();
      }
      this._replacerLambdaFn = this.createReplacementFn();
      super.usingChainableDefinition(this.createStateDefinition());
    }
    super.assemble(stateMachineProps);
    return this;
  }
}