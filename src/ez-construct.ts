import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

/**
 * A marker base class for EzConstructs
 */
export class EzConstruct extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);
  }

  /**
 * Will set the value of an SSM parameter.
 * @param scope - usually the stack
 * @param id - the identifier prefix to use for SSM propery
 * @param key - the property key to set
 * @param value - the property value to set
 */
  public setParameter(id: string, key: string, value: string) {
    new StringParameter(this, id, {
      parameterName: key,
      stringValue: value,
    });
  }
}
