import { Utils } from '../../src/lib/utils';


describe('Utils', () => {
  test('should append suffixes', () => {
    expect(Utils.appendIfNecessary('hello', 'world', 'again')).toBe('hello-world-again');
  });
  test('should append suffixes only if needed', () => {
    expect(Utils.appendIfNecessary('hello-world', 'world', 'again')).toBe('hello-world-again');
  });

  test('should not append suffixes when not provided', () => {
    expect(Utils.appendIfNecessary('hello-world')).toBe('hello-world');
  });

});