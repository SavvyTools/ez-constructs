import { Utils } from '../../src/lib/utils';


describe('Utils', () => {

  describe('appendIfNecessry', () => {
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
  describe('wrap', () => {

    test('should add suffix and prefix', () => {
      expect(Utils.wrap('hello/world', '/')).toBe('/hello/world/');
    });
    test('should add suffix if needed', () => {
      expect(Utils.wrap('/hello/world', '/')).toBe('/hello/world/');
    });
    test('should add prefix if needed', () => {
      expect(Utils.wrap('hello/world/', '/')).toBe('/hello/world/');
    });
    test('should add suffix and prefix only if needed', () => {
      expect(Utils.wrap('/hello/world/', '/')).toBe('/hello/world/');
    });
  });

});