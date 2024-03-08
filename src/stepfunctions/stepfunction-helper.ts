import { Arn, ArnFormat, Stack, Token } from 'aws-cdk-lib';
import { IRole } from 'aws-cdk-lib/aws-iam';
import { Code, Runtime, SingletonFunction } from 'aws-cdk-lib/aws-lambda';
import { Bucket, IBucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { StandardSparkSubmitJobTemplate } from './spark-job-template';
import { Utils } from '../lib/utils';

export class StepfunctionHelper {

  /**
     * Will create replacements of text in %KEY%, with actual value of the KEY
     * @private
     */
  static createReplacementFn(scope:Construct, name:string): SingletonFunction {

    return new SingletonFunction(scope, 'Replacer', {
      uuid: '86323b0e-2faf-5a68-a6c1-7da4b4e3c3e5',
      lambdaPurpose: 'replace',
      functionName: Utils.kebabCase(`${name}-Replacer`),
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
  static createValidatorFn(scope:Construct, name:string): SingletonFunction {

    return new SingletonFunction(scope, 'Validator', {
      uuid: '93243b0e-6fbf-4a68-a6c1-6da4b4e3c3e4',
      lambdaPurpose: 'validation',
      functionName: Utils.kebabCase(`${name}-EntryArgsValidator`),
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


  /**
   * A bucket to store the logs producee by the Spark jobs.
   * @param bucket
   */
  static createLogBucket(scope:Construct, account:string, region:string, bucket: string | IBucket): IBucket {

    if (typeof bucket === 'string') {
      return Bucket.fromBucketName(scope, 'LoggingBucket', Utils.appendIfNecessary(bucket, account, region));
    }
    return bucket;
  }

  static generateApplicationArn(scope: Construct, applicationId:string): string {
    return Token.asString(Stack.of(scope).formatArn({
      service: 'emr-serverless',
      resource: 'applications',
      resourceName: applicationId,
      arnFormat: ArnFormat.SLASH_RESOURCE_SLASH_RESOURCE_NAME,
    }));
  }

  static generateRoleArn(scope: Construct, role:IRole): string {
    return Token.asString(Stack.of(scope).formatArn({
      partition: 'aws',
      service: 'iam',
      resource: 'role',
      region: '',
      resourceName: Arn.extractResourceName(role?.roleArn!, 'role'),
      arnFormat: ArnFormat.SLASH_RESOURCE_NAME,
    }));

  }

  static getlog4jPatchScript(releaseLabel: string): string {
    let revisions = this.getEmrVersion(releaseLabel);
    if (revisions[0] == 6 && revisions[1] < 6) {
      let lookup = {
        5: 's3://elasticmapreduce/bootstrap-actions/log4j/patch-log4j-emr-6.5.0-v2.sh',
        4: 's3://elasticmapreduce/bootstrap-actions/log4j/patch-log4j-emr-6.4.0-v2.sh',
        3: 's3://elasticmapreduce/bootstrap-actions/log4j/patch-log4j-emr-6.3.1-v2.sh',
        2: 's3://elasticmapreduce/bootstrap-actions/log4j/patch-log4j-emr-6.2.1-v2.sh',
        1: 's3://elasticmapreduce/bootstrap-actions/log4j/patch-log4j-emr-6.1.1-v2.sh',
        0: 's3://elasticmapreduce/bootstrap-actions/log4j/patch-log4j-emr-6.0.1-v2.sh',
      };
      return lookup[revisions[1]];
    }
    return '';
  }

  static getEmrVersion(releaseLabel: string): Array<number> {
    const pattern: RegExp = /emr-(\d+)\.(\d+)/;
    const match: RegExpMatchArray | null = releaseLabel.match(pattern);
    if (match) {
      const major = parseInt(match[1]);
      const minor = parseInt(match[2]);
      return [major, minor];
    }
    return [0, 0];
  }
}