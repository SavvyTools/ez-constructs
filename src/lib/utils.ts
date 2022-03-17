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
}