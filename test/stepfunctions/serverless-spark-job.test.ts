import '@aws-cdk/assert/jest';
import { App, Stack } from 'aws-cdk-lib';
import { FileUtils, Utils, SimpleServerlessSparkJob } from '../../src';


describe('SimpleServerlessSparkJob Construct', () => {

  describe('Basic Serverless Spark Job', () => {
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

    test('default job configuration template setup', () => {

      // WHEN
      new SimpleServerlessSparkJob(mystack, 'SingleFly', 'MyTestETL')
        .jobRole('delegatedadmin/developer/blames-emr-serverless-job-role')
        .applicationId('12345676')
        .logBucket('mylogbucket')
        .usingSparkJobTemplate({
          jobName: 'mytestjob',
          entryPoint: 's3://aws-cms-amg-qpp-costscoring-artifact-dev-222224444433-us-east-1/biju_test_files/myspark-assembly.jar',
          entryPointArgumentNames: ['--input', '--output', '--performanceYear'],
          mainClass: 'serverless.SimpleSparkApp',
          enableMonitoring: true,
        })
        .assemble();


      // WITH a state machine named MyTestETL
      expect(mystack).toHaveResourceLike('AWS::IAM::Role', {
        RoleName: 'MyTestETLStateMachineRole',
      });

      // WITH a state machine named MyTestETL
      expect(mystack).toHaveResourceLike('AWS::StepFunctions::StateMachine', {
        StateMachineName: 'MyTestETL',
      });


    });

    test('default job configuration string definition setup', () => {
      let asl = FileUtils.readFile('test/stepfunctions/single-job-asl.json');

      // WHEN
      let etl = new SimpleServerlessSparkJob(mystack, 'SingleFly', 'MyTestETL')
        .jobRole('delegatedadmin/developer/blames-emr-serverless-job-role')
        .applicationId('12345676')
        .logBucket('mylogbucket')
        .usingStringDefinition(asl)
        .withDefaultInputs({
          crazy: 'day',
        })
        .assemble();

      // THEN should have a modified ASL.
      let definition = JSON.parse(etl.stateDefinitionAsString);
      expect(definition).toBeDefined();
      let params = definition.States.RunSparkJob.Parameters;
      expect(params).toBeDefined();

      // WITH async call back task token
      expect(params.JobDriver.SparkSubmit['EntryPointArguments.$']).toEqual('States.Array($$.Task.Token)');

      let monitoringConfiguration = params.ConfigurationOverrides.MonitoringConfiguration;
      expect(monitoringConfiguration).toBeDefined();

      // WITH logging to S3
      expect(monitoringConfiguration.S3MonitoringConfiguration.LogUri).toEqual('s3://mylogbucket-111111111111-us-east-1/MyTestETL/mytestjob');

      // WITH a 90 day log preservation period
      expect(monitoringConfiguration.ManagedPersistenceMonitoringConfiguration.Enabled).toBeTruthy();

      // WITH logging to MyTestETLLogGroup
      expect(mystack).toHaveResourceLike('AWS::Logs::LogGroup', {
        LogGroupName: 'MyTestETLLogGroup',
        RetentionInDays: 90,
      });

      // WITH a state machine named MyTestETL
      expect(mystack).toHaveResourceLike('AWS::StepFunctions::StateMachine', {
        StateMachineName: 'MyTestETL',
        DefinitionString: Utils.escapeDoubleQuotes(etl.stateDefinitionAsString),
      });

    });


    test('multi job configuration string definition setup', () => {
      let asl = FileUtils.readFile('test/stepfunctions/multi-job-asl.json');

      // WHEN
      let etl = new SimpleServerlessSparkJob(mystack, 'MultiFly', 'MyMultiTestETL')
        .jobRole('delegatedadmin/developer/blames-emr-serverless-job-role')
        .applicationId('12345676')
        .logBucket('mylogbucket')
        .usingStringDefinition(asl)
        .withDefaultInputs({
          name: 'Thrinath',
          address: {
            street: '123 Main St',
            city: 'Seattle',
            state: 'WA',
            zip: '98101',
          },
        })
        .assemble();

      // THEN should have a modified ASL.
      let definition = JSON.parse(etl.stateDefinitionAsString!);
      expect(definition).toBeDefined();

      // WITH job one
      let params = definition.States.RunSparkJobOne.Parameters;
      expect(params).toBeDefined();

      // WITH async call back task token
      expect(params.JobDriver.SparkSubmit['EntryPointArguments.$']).toEqual('States.Array($$.Task.Token)');

      let monitoringConfiguration = params.ConfigurationOverrides.MonitoringConfiguration;
      expect(monitoringConfiguration).toBeDefined();

      // WITH logging to S3
      expect(monitoringConfiguration.S3MonitoringConfiguration.LogUri).toEqual('s3://mylogbucket-111111111111-us-east-1/MyMultiTestETL/mytestjobone');

      // WITH a 90 day log preservation period
      expect(monitoringConfiguration.ManagedPersistenceMonitoringConfiguration.Enabled).toBeTruthy();

      // WITH logging to MyTestETLLogGroup
      expect(mystack).toHaveResourceLike('AWS::Logs::LogGroup', {
        LogGroupName: 'MyMultiTestETLLogGroup',
        RetentionInDays: 90,
      });

      // WITH job two
      params = definition.States.RunSparkJobTwo.Parameters;
      expect(params).toBeDefined();

      // WITH async call back task token
      expect(params.JobDriver.SparkSubmit['EntryPointArguments.$']).toEqual('States.Array($$.Task.Token)');


      // WITH a state machine named MyTestETL
      expect(mystack).toHaveResourceLike('AWS::StepFunctions::StateMachine', {
        StateMachineName: 'MyMultiTestETL',
        DefinitionString: Utils.escapeDoubleQuotes(etl.stateDefinitionAsString),
      });

    });

    test('default job configuration without spark job', () => {
      let asl = FileUtils.readFile('test/stepfunctions/some-other-asl.json');

      // WHEN
      let etl = new SimpleServerlessSparkJob(mystack, 'SomeOther', 'MyTestETL')
        .jobRole('path/to/a-role')
        .applicationId('12345676')
        .logBucket('mylogbucket')
        .usingStringDefinition(asl)
        .assemble();

      // THEN should not have a modified ASL.
      let definition = JSON.parse(etl.stateDefinitionAsString);
      expect(definition).toBeDefined();
      // @ts-ignore
      let modified = Object.values(definition.States).filter( value => {
        // @ts-ignore
        return value.Parameters && value.Parameters.JobDriver.SparkSubmit['EntryPointArguments.$'];
      });

      expect(modified).toEqual([]);

    });

  });

  describe('Serverless Spark Job - Definition', () => {
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

    test('default job configuration template setup', () => {
      // WHEN
      new SimpleServerlessSparkJob(mystack, 'SingleFly', 'MyTestETL')
        .jobRole('delegatedadmin/developer/blames-emr-serverless-job-role')
        .applicationId('12345676')
        .logBucket('mylogbucket')
        .usingSparkJobTemplate({
          jobName: 'mytestjob',
          entryPoint: 's3://aws-cms-amg-qpp-costscoring-artifact-dev-222224444433-us-east-1/biju_test_files/myspark-assembly.jar',
          entryPointArgumentNames: ['--input', '--output', '--performanceYear'],
          mainClass: 'serverless.SimpleSparkApp',
          enableMonitoring: true,
        })
        .withDefaultInputs({
          age: 10,
          country: 'USA',
        })
        .assemble();


      // THEN should have a modified ASL.
      let stateDef = Utils.fetchStepFuncitonStateDefinition(mystack);
      expect(stateDef).toBeDefined();
      expect(stateDef.StartAt).toEqual('LoadDefaults');
      expect(stateDef.States.RunSparkJob).toBeDefined();
      expect(stateDef.States.LoadDefaults).toBeDefined();
      expect(stateDef.States.ApplyDefaults).toBeDefined();
      expect(stateDef.States.Fail).toBeDefined();
      expect(stateDef.States.Success).toBeDefined();

      let sparkJob = stateDef.States.RunSparkJob;
      expect(sparkJob.Parameters).toBeDefined();
      expect(sparkJob.ResultPath).toEqual('$.JobStatus');
      expect(sparkJob.Resource).toEqual('arn::states:::aws-sdk:emrserverless:startJobRun.waitForTaskToken');

      let jobComplete = stateDef.States['Job Complete ?'];
      expect(jobComplete).toBeDefined();
      expect(jobComplete.Type).toEqual('Choice');
      expect(jobComplete.Choices[0].Variable).toEqual('$.JobStatus.Status');
      expect(jobComplete.Choices[0].StringEquals).toEqual('Success');

      let entryArgs = stateDef.States.EntryArgs;
      expect(entryArgs).toBeDefined();
      expect(entryArgs.Parameters.args).toEqual('--input,--output,--performanceYear');

      let validatorFn = stateDef.States.ValidatorFnInvoke;
      expect(validatorFn).toBeDefined();

    });

    test('job configuration template without entry point args', () => {
      // WHEN
      new SimpleServerlessSparkJob(mystack, 'SingleFly', 'MyTestETL')
        .jobRole('delegatedadmin/developer/blames-emr-serverless-job-role')
        .applicationId('12345676')
        .logBucket('mylogbucket')
        .usingSparkJobTemplate({
          jobName: 'mytestjob',
          entryPoint: 's3://aws-cms-amg-qpp-costscoring-artifact-dev-222224444433-us-east-1/biju_test_files/myspark-assembly.jar',
          mainClass: 'serverless.SimpleSparkApp',
          enableMonitoring: true,
        })
        .withDefaultInputs({
          age: 10,
          country: 'USA',
        })
        .assemble();


      // THEN should have a modified ASL.
      let stateDef = Utils.fetchStepFuncitonStateDefinition(mystack);
      let validatorFn = stateDef.States.ValidatorFnInvoke;
      expect(validatorFn).not.toBeDefined();
    });


  });

});