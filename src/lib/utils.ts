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
    if (!_.startsWith(str, delimiter)) newStr = `${delimiter}${newStr}`;
    if (!_.endsWith(str, delimiter)) newStr = `${newStr}${delimiter}`;
    return newStr;
  }
}