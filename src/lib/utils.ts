import * as fs from 'fs';
import { readFileSync } from 'fs';
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
  public static wrap(str: string, delimiter: string): string {
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
  public static startsWith(str: string, s: string): boolean {
    return _.startsWith(str, s);
  }

  /**
   * Will check if the given string ends with the given suffix.
   * @param str - a string
   * @param s - suffix to check
   */
  public static endsWith(str: string, s: string): boolean {
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
   * Will convert the given string to camel case.
   * @param str - a string
   */
  public static camelCase(str: string): string {
    return _.camelCase(str);
  }

  /**
   * Will escape double quotes in the given string.
   */
  public static escapeDoubleQuotes(str: string): string {
    return _.replace(str, new RegExp('"', 'g'), '\"');
  }
  /**
   * Splits a given Github URL and extracts the owner and repo name
   * @param url
   */
  public static parseGithubUrl(url: string): any {
    if (Utils.isEmpty(url)) throw new TypeError('Invalid URL');
    if (!(Utils.startsWith(url, 'https://github.cms.gov/') || Utils.startsWith(url, 'https://github.com'))) throw new TypeError('Invalid URL');
    if (!Utils.endsWith(url, '.git')) throw new TypeError('Invalid URL');

    // find the details from url
    let u = new URL(url);
    let owner = u.pathname.split('/')[1];
    let repo = _.replace(u.pathname.split('/')[2], '.git', '');
    let enterprise = u.hostname == 'github.cms.gov';
    let github = u.hostname == 'github.com';

    if (_.isEmpty(owner) || _.isEmpty(repo)) throw new TypeError('Invalid URL');

    return {
      owner,
      repo,
      github,
      enterprise,
    };
  }

  /**
   * A utility function that will print the content of a CDK stack.
   * @warning This function is only used for debugging purpose.
   * @param stack - a valid stack
   */
  public static prettyPrintStack(stack: Stack, persist = true, path= `tmp/${stack.stackName}.json`): void {
    let t = Template.fromStack(stack);
    console.log(JSON.stringify(t.toJSON(), null, 2));
    if (persist) {
      fs.writeFileSync(path, JSON.stringify(t.toJSON(), null, 2));
    }
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

  /**
   * Will check if the given string is contained in another string.
   * @param str - a string
   * @param s - the string to check for
   */
  public static contains(str: string, s: string): boolean {
    return _.includes(str, s);
  }

  /**
   * Merges two objects
   */
  public static merge(obj1: any, obj2: any): any {
    return _.merge(obj1, obj2);
  }

}

export class FileUtils {
  /**
   * Will read the file from the given path and return the content as a string.
   * @param path
   */
  public static readFile(path: string): string {
    return readFileSync(path, 'utf8');
  }

}