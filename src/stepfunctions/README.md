# Step Function Constructs

## SimpleServerlessSparkJob
**Motivation**

It is not uncommon in the real world for an ETL job to only have one Spark job associated with it. This construct provides a simple API that collects the bare minimum information such as the uber.jar and main class and creates a step function based workflow. Afterwards, users can execute the step function with parameters overrides and run the spark job. 

```ts
    new SimpleServerlessSparkJob(mystack, 'SingleFly')
        .name('MyTestETL')
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
The above code creates a step function that looks like the following: 
