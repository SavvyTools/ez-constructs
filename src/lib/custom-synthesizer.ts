import { DefaultStackSynthesizer } from 'aws-cdk-lib';
import { Utils } from './utils';

/**
 * As a best practice organizations enforce policies which require all custom IAM Roles created to be defined under
 * a specific path and permission boundary.
 * In order to adhere with such compliance requirements, the CDK bootstrapping is often customized
 * (refer: https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping.html#bootstrapping-customizing).
 * So, we need to ensure that parallel customization is applied during synthesis phase.
 * This Custom Synthesizer is used to modify the default path of the following IAM Roles internally used by CDK:
 *  - deploy role
 *  - file-publishing-role
 *  - image-publishing-role
 *  - cfn-exec-role
 *  - lookup-role

 * @see PermissionsBoundaryAspect
 */
export class CustomSynthesizer extends DefaultStackSynthesizer {

  private static qualifiedRole(roleName: string, rolePath: string): string {
    return 'arn:${AWS::Partition}:iam::${AWS::AccountId}:role' +
      Utils.wrap(rolePath, '/') +
      'cdk-${Qualifier}-' +
      roleName +
      '-${AWS::AccountId}-${AWS::Region}';
  }

  constructor(rolePath: string) {
    super({
      deployRoleArn: CustomSynthesizer.qualifiedRole('deploy-role', rolePath),
      fileAssetPublishingRoleArn: CustomSynthesizer.qualifiedRole('file-publishing-role', rolePath),
      imageAssetPublishingRoleArn: CustomSynthesizer.qualifiedRole('image-publishing-role', rolePath),
      cloudFormationExecutionRole: CustomSynthesizer.qualifiedRole('cfn-exec-role', rolePath),
      lookupRoleArn: CustomSynthesizer.qualifiedRole('lookup-role', rolePath),
    });
  }

}