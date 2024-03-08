import { CfnCluster } from 'aws-cdk-lib/aws-emr';
import { IRole } from 'aws-cdk-lib/aws-iam';
import { SingletonFunction } from 'aws-cdk-lib/aws-lambda';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import {
  Choice,
  Condition,
  Errors,
  Fail,
  IChainable,
  IntegrationPattern,
  Pass,
  Succeed, TaskInput,
} from 'aws-cdk-lib/aws-stepfunctions';
import { StateMachineProps } from 'aws-cdk-lib/aws-stepfunctions/lib/state-machine';
import { CallAwsService, EmrAddStep, EmrCreateCluster, LambdaInvoke } from 'aws-cdk-lib/aws-stepfunctions-tasks';
import {
  EmrCreateClusterProps,
} from 'aws-cdk-lib/aws-stepfunctions-tasks/lib/emr/emr-create-cluster';
import { Construct } from 'constructs';
import InstanceFleetConfigProperty = CfnCluster.InstanceFleetConfigProperty;
import { SimpleStepFunction } from './simple-stepfunction';
import { InstanceConfig, StandardSparkSubmitJobTemplate } from './spark-job-template';
import { StepfunctionHelper } from './stepfunction-helper';
import { Utils } from '../lib/utils';
import EbsBlockDeviceVolumeType = EmrCreateCluster.EbsBlockDeviceVolumeType;
import { Size } from 'aws-cdk-lib';

export class SimpleServerlessSparkJob extends SimpleStepFunction {
  private _validatorLambdaFn?: SingletonFunction;
  private _replacerLambdaFn?: SingletonFunction;

  private _logBucket?: IBucket;
  private _jobRole?: IRole;
  private _serviceRole?: IRole;

  private _singleSparkJobTemplate?: StandardSparkSubmitJobTemplate;


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
   * A bucket to store the logs producee by the Spark jobs.
   * @param bucket
   */
  logBucket(bucket: string | IBucket): SimpleServerlessSparkJob {
    this._logBucket = StepfunctionHelper.createLogBucket(this.scope, this.account, this.region, bucket);
    return this;
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

  private createClusterProps(): EmrCreateClusterProps {
    let pipelineName = Utils.camelCase(this._name);
    let clusterName = `${pipelineName}Cluster`;
    let releaseLabel = this._singleSparkJobTemplate?.clusterConfig?.releaseLabel || 'emr-6.11.0';
    let defaults:any = {
      name: clusterName,
      releaseLabel,
      instances: {
        terminationProtected: false,
        instanceFleets: [],
      },
      visibleToAllUsers: true,
      resultPath: '$.cluster',
    };

    defaults.logUri = this._logBucket?.s3UrlForObject(`/${pipelineName}`);

    let log4jPatchScript = StepfunctionHelper.getlog4jPatchScript(releaseLabel);
    if (!Utils.isEmpty(log4jPatchScript)) {
      defaults.bootstrapActions = [{
        name: 'aws-patch-log4j',
        scriptBootstrapAction: {
          path: log4jPatchScript,
        },
      }];
    }
    let apps = ['Spark', 'Hadoop', 'Ganglia'];
    if (this._singleSparkJobTemplate?.clusterConfig?.applications) {
      apps.push(...this._singleSparkJobTemplate?.clusterConfig?.applications);
    }
    defaults.applications = apps.map(name => {name;});

    if (this._singleSparkJobTemplate?.clusterConfig?.configurations) {
      defaults.configurations = this._singleSparkJobTemplate?.clusterConfig.configurations;
    }
    let instanceConfigs:Array<InstanceConfig> = this._singleSparkJobTemplate?.clusterConfig?.instances || [];
    instanceConfigs.forEach(ic => {
      let instanceName = ic.name || `${pipelineName}-${ic.nodeType.toString()}`;
      let fleet:any = {
        name: instanceName,
        targetOnDemandCapacity: ic.targetOnDemandCpacity,
        instanceFleetType: ic.nodeType.toString(),
        instanceTypeConfigs: [
          {
            instanceType: ic.instanceType,
            ebsConfiguration: {
              ebsBlockDeviceConfigs: [{
                volumesPerInstance: 1,
                volumeSpecification: {
                  volumeSize: Size.gibibytes(ic.diskSizeInGb || 1000),
                  volumeType: EbsBlockDeviceVolumeType.GP2,
                },
              }],
            },
          },
        ],
      };
      defaults.instances.instanceFleets.push(fleet);
    });

    return defaults as EmrCreateClusterProps;
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

    let createClusterState = new EmrCreateCluster(this.scope, 'Create Cluster', this.createClusterProps());

    let argsLine = 'States.Array($$.Task.Token';
    this.defaultInputs.entryPointArgumentNames?.forEach((k:any) => {
      argsLine += `,'${k}',$['${k}']`;
    });
    argsLine += ')';

    const emrStepState = new EmrAddStep(this, 'RunSparkJob', {
      name: this._singleSparkJobTemplate?.jobName || 'task',
      clusterId: TaskInput.fromJsonPathAt('$.cluster.ClusterId').value,
      jar: 'command-runner.jar',
      mainClass: this._singleSparkJobTemplate?.mainClass,
      Args.$: argsLine,
    });
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
        .otherwise(createClusterState.next(runJobState))
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
      .next(clusterState)
      .next(runJobState)
      .next(jobCompleteState);

  }


}