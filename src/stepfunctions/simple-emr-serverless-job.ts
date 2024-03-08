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
import { SimpleStepFunction } from './simple-stepfunction';

import { StandardSparkSubmitJobTemplate } from './spark-job-template';
import { StepfunctionHelper } from './stepfunction-helper';
import { Utils } from '../lib/utils';


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
 *   .jobRole('delegatedadmin/developer/blames-emr-serverless-job-role')
 *   .applicationId('12345676')
 *   .logBucket('mylogbucket-name')
 *   .usingDefinition("{...json step function string.... }")
 *   .assemble();
 * ```
 * If we have to read differnent input parameters for the spark job, we can have variables that extract values from the context.
 * ```typescript
 * new SimpleServerlessSparkJob(mystackObj, 'MultiFly')
 *   .name('MyAwesomeETL')
 *   .jobRole('delegatedadmin/developer/blames-emr-serverless-job-role')
 *   .applicationId('12345676')
 *   .logBucket('mylogbucket-name')
 *   .usingDefinition("{...json step function string.... }")
 *   .withDefaultInputs({"some":"thing", "other": "thing"})
 *   .assemble();
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
    this._jobRoleArn = StepfunctionHelper.generateRoleArn(this.scope, this._jobRole);
    this.grantPassRole(this._jobRole);
    return this;
  }

  /**
     * The serverless application ID, and to that application the jobs will be submitted.
     * @param applicaitonId
     */
  applicationId(applicaitonId: string): SimpleServerlessSparkJob {
    this._applicationId = applicaitonId;
    this._applicationArn = StepfunctionHelper.generateApplicationArn(this.scope, applicaitonId);
    return this;
  }

  /**
     * A bucket to store the logs producee by the Spark jobs.
     * @param bucket
     */
  logBucket(bucket: string | IBucket): SimpleServerlessSparkJob {
    this._logBucket = StepfunctionHelper.createLogBucket(this.scope, this.account, this.region, bucket);
    return this;
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

  assemble(stateMachineProps?: StateMachineProps): SimpleStepFunction {
    if (this._singleSparkJobTemplate) {
      if (this._singleSparkJobTemplate.entryPointArgumentNames) {
        this._validatorLambdaFn = StepfunctionHelper.createValidatorFn(this.scope, this._name);
      }
      this._replacerLambdaFn = StepfunctionHelper.createReplacementFn(this.scope, this._name);
      super.usingChainableDefinition(this.createStateDefinition());
    }
    super.assemble(stateMachineProps);
    return this;
  }
}