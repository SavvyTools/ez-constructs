# SimpleServerlessApplication

**Motivation**

Creating an EMR Serverless Application is a straightforward process, but effectively monitoring and benchmarking it can be challenging. This construct simplifies the creation of an application and CloudWatch Dashboard, enabling seamless resource usage monitoring.

Usage:

```ts
import {SimpleServerlessApplication} from "./serverless";

new SimpleServerlessApplication(mystack, 'DefaultEmrApp')
    .name('MyDefaultEmrApp')
    .vpc('vpc-0c472b04d1b6482c4')
    .assemble();
```
You can also provide additional properties for overriding during assembly, as demonstrated below:
For a detailed list of permissible property values, refer to [CfnApplicationProps](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_emrserverless.CfnApplicationProps.html)
```ts
    new SimpleServerlessApplication(mystack, 'DefaultEmrApp')
        .name('MyDefaultEmrApp')
        .vpc('vpc-0c472b04d1b6482c4')
        .assemble({
            /* props */
        });
```
