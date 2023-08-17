# Step Function Constructs

## SimpleServerlessSparkJob
Hint: This construct is tuned for EMR Serverless Spark workflow.

**Motivation**

It is not uncommon in the real world for an ETL job to only have one Spark job associated with it. This construct provides a simple API that collects the bare minimum information such as the uber.jar and main class and creates a step function based workflow. Afterwards, users can execute the step function with parameters overrides and run the spark job. 

```ts
    new SimpleServerlessSparkJob(mystack, 'SingleFly', 'C2QProcessingETL')
        .jobRole('delegatedadmin/developer/blames-emr-serverless-job-role')
        .applicationId('12345676')
        .logBucket('my-log-bucket-name')
        .usingDefinition({
          jobName: 'mytestjob',
          entryPoint: 's3://my-artifact-bucket-222224444433-us-east-1/biju_test_files/myspark-assembly.jar',
          mainClass: 'serverless.SimpleSparkApp',
          enableMonitoring: true,
        })
        .assemble();
```
By default, the above construct will add `EntryPoint` and `SparkSubmitParameters` as default parameter, and users can override that while starting the step function workflow. 
Additionally, there can be cases where the user would like to supply additional default parameters, that can be achived easily as well. 
```ts
new SimpleServerlessSparkJob(mystack, 'SingleFly', 'C2QProcessingETL')
        .jobRole('delegatedadmin/developer/blames-emr-serverless-job-role')
        .applicationId('12345676')
        .logBucket('my-log-bucket-name')
        .usingDefinition({
          jobName: 'mytestjob',
          entryPoint: 's3://my-artifact-bucket-222224444433-us-east-1/biju_test_files/myspark-assembly.jar',
          mainClass: 'serverless.SimpleSparkApp',
          enableMonitoring: true,
        })
    .defaultParameters({
        "movie": {
            "primeVideo": "No Country for Old Men"
        },
        "month": "August"
    })
    .assemble();
```
In the above case, in addition to the `EntryPoint` and `SparkSubmitParameters`, while starting execution one could override the `movie` and `month` parameter as well.

What if you prefer to create your own spark serverless workflow or have an serverless workflow that has many steps. In such circumstances, you could supply your custom workflow definition as shown below:
```ts
// read the JSON definition from a file
let asl = FileUtils.readFile('test/stepfunctions/multi-job-asl.json');

new SimpleServerlessSparkJob(mystack, 'MultiFly', 'MyTestETLWorkflow')
    .jobRole('delegatedadmin/developer/blames-emr-serverless-job-role')
    .applicationId('12345676')
    .logBucket('mylogbucket')
    .usingStringDefinition(asl) // supply the definition
    .withDefaultInputs({
         "crazy:: "day",
        "SparkSubmitParameters": {
           "--conf spark.executor.memory=2g",
           "--conf spark.executor.cores=2"
        }  
    })
    .assemble();
```
Under the hoods, the Spark Serverless step function invokes 
[StartJobRun](https://docs.aws.amazon.com/emr-serverless/latest/APIReference/API_StartJobRun.html) API call via `CallAwsService` task definition. Additional overriding is possible via JSON step funciton systax. 

## SimpleStepFunction

**Motivation**

Step functions are not just limited to EMR worklods, the `SimpleStepFunction` construct provides easy APIs to create step function workflows from string definitions.
```ts
new SimpleStepFunction(mystack, 'MultiFlySomeOtherThing', 'MyGenericWorkflow')
    .addPolicy(new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['s3:GetObject'],
        resources: ['arn:aws:s3:::myOtherBucket/*']
    }))
    .addPolicy(new PolicyStatement({
        "Effect": "Allow",
        "Action": "sqs:SendMessage",
        "Resource": "arn:aws:sqs:us-east-1:123456789012:MyQueue"
    }))
    .logBucket('mylogbucket')
    .usingStringDefinition(asl) // supply the definition
    .withDefaultInputs({
         "defaultMessage": "Payday friday"
    })
    .grantPassRole(someOtherRoleObj)
    .assemble();
```