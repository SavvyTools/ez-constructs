import { Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { NagSuppressions } from 'cdk-nag';
import { IConstruct } from 'constructs';
import * as _ from 'lodash';

/**
 * A utility class that have common functions.
 */
export class Utils {
  /**
   * Will append the suffix to the given name if the name do not contain the suffix
   * @param name - a string
   * @param suffixes - the string to append
   * @returns the name with the suffix appended if necessary delimited by a hyphen
   */
  public static appendIfNecessary(name: string, ...suffixes: string[]): string {
    let newName = name;

    suffixes.forEach(suffix => {
      newName = _.includes(newName, suffix) ? newName : `${newName}-${suffix}`;
    });

    return newName;
  }

  /**
   * Will wrap the given string using the given delimiter.
   * @param str - the string to wrap
   * @param delimiter - the delimiter to use
   * @returns the wrapped string
   */
  public static wrap(str:string, delimiter:string): string {
    let newStr = str;
    if (!Utils.startsWith(str, delimiter)) newStr = `${delimiter}${newStr}`;
    if (!Utils.endsWith(str, delimiter)) newStr = `${newStr}${delimiter}`;
    return newStr;
  }

  /**
   * Will check if the given string starts with the given prefix.
   * @param str - a string
   * @param s - the prefix to check
   */
  public static startsWith(str:string, s:string): boolean {
    return _.startsWith(str, s);
  }

  /**
   * Will check if the given string ends with the given suffix.
   * @param str - a string
   * @param s - suffix to check
   */
  public static endsWith(str:string, s:string): boolean {
    return _.endsWith(str, s);
  }

  /**
   * Will check if the given object is empty
   * @param value
   */
  public static isEmpty(value?: any): boolean {
    return _.isEmpty(value);
  }

  /**
   * Will convert the given string to lower case and transform any spaces to hyphens
   * @param str - a string
   */
  public static kebabCase(str: string): string {
    return _.kebabCase(_.toLower(str));
  }

  /**
   * Splits a given Github URL and extracts the owner and repo name
   * @param url
   */
  public static parseGithubUrl(url: string): any {
    if (Utils.isEmpty(url)) throw new TypeError('Invalid URL');
    if (!( Utils.startsWith(url, 'https://github.cms.gov/') || Utils.startsWith(url, 'https://github.com'))) throw new TypeError('Invalid URL');
    if (!Utils.endsWith(url, '.git')) throw new TypeError('Invalid URL');

    // find the details from url
    let u = new URL(url);
    let owner = u.pathname.split('/')[1];
    let repo = _.replace(u.pathname.split('/')[2], '.git', '');
    let enterprise = u.hostname == 'github.cms.gov';
    let github = u.hostname == 'github.com';

    if (_.isEmpty(owner) || _.isEmpty(repo)) throw new TypeError('Invalid URL');

    return { owner, repo, github, enterprise };
  }

  /**
   * A utility function that will print the content of a CDK stack.
   * @warning This function is only used for debugging purpose.
   * @param stack - a valid stack
   */
  public static prettyPrintStack(stack: Stack): void {
    let t = Template.fromStack(stack);
    console.log(JSON.stringify(t.toJSON(), null, 2));
  }

  /**
   * Will disable the CDK NAG rule for the given construct and its children.
   * @param scope - the scope to disable the rule for
   * @param ruleId - the rule id to disable
   * @param reason - reason for disabling the rule.
   */
  public static suppressNagRule(scope: IConstruct, ruleId: string, reason?: string) {
    NagSuppressions.addResourceSuppressions(scope, [{
      id: ruleId,
      reason: reason || `${ruleId} is not needed in this context (${scope.node.id}).`,
    }], true);
  }

}