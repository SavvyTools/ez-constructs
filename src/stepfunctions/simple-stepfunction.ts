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