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

  describe('startsWith', () => {

    test('should be true', () => {
      expect(Utils.startsWith('https://github.com/SavvyTools/ez-constructs.git', 'https://github.com/'))
        .toBe(true);
    });

    test('should be true for entprise git url', () => {
      expect(Utils.startsWith('https://github.cms.gov/qpp/qpp-integration-test-infrastructure-cdk.git', 'https://github.cms.gov/'))
        .toBe(true);
    });

    test('should be false', () => {
      expect(Utils.startsWith('https://github.com/SavvyTools/ez-constructs.git', 'github.com/'))
        .toBe(false);
    });

  });
  describe('endsWith', () => {

    test('should be true', () => {
      expect(Utils.endsWith('https://github.com/SavvyTools/ez-constructs.git', '.git'))
        .toBe(true);
    });

    test('should be false', () => {
      expect(Utils.startsWith('https://github.com/SavvyTools/ez-constructs.git', 'abcd'))
        .toBe(false);
    });

  });

  describe('escapeDoublQuotes', () => {

    test('should escape correctly double quotes', () => {
      expect(Utils.escapeDoubleQuotes('{"hello": "world"}')).toEqual('{\"hello\": \"world\"}');
    });

    test('should not escape anything when double quotes is not available', () => {
      expect(Utils.escapeDoubleQuotes('hello world')).toEqual('hello world');
    });

  });

  describe('parseGithubUrl', () => {

    test('should get the right owner and repo name for org repos', () => {
      expect(Utils.parseGithubUrl('https://github.com/SavvyTools/ez-constructs.git'))
        .toEqual({ owner: 'SavvyTools', repo: 'ez-constructs', github: true, enterprise: false });
    });

    test('should get the right owner and repo name for non org repos', () => {
      expect(Utils.parseGithubUrl('https://github.com/bijujoseph/cloudbiolinux.git'))
        .toEqual({ owner: 'bijujoseph', repo: 'cloudbiolinux', github: true, enterprise: false });
    });

    test('should parse enterprise github url properly', () => {
      expect(Utils.parseGithubUrl('https://github.cms.gov/qpp/qpp-integration-test-infrastructure-cdk.git'))
        .toEqual({ owner: 'qpp', repo: 'qpp-integration-test-infrastructure-cdk', github: false, enterprise: true });
    });

    test('should throw error when url is not provided ', () => {
      expect(() => Utils.parseGithubUrl('')).toThrowError('Invalid URL');
    });

    test('should throw error when url is not having all parts ', () => {
      expect(() => Utils.parseGithubUrl('https://hello.com')).toThrowError('Invalid URL');
    });
  });

});