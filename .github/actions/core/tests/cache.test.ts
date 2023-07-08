import fs from 'fs';
import { mkdirP } from '@actions/io';
import { Cache, createCache } from '../src/cache';

jest.mock('@actions/io', () => ({
  readFile: jest.fn(),
  mkdirP: jest.fn(),
}));

jest.mock('@actions/core', () => ({
  info: () => jest.fn(),
  debug: () => jest.fn(),
  warning: () => jest.fn(),
  getInput: () => jest.fn(),
  getBooleanInput: () => jest.fn(),
}));

jest.mock('fs');

jest.mock('path', () => ({
  join: (name: string) => name,
}));

describe('Cache', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('constructor', () => {
    it('should initialize cache properties correctly', () => {
      const testCache = new Cache('test');
      expect(testCache.name).toBe('test');
    });
  });

  describe('get', () => {
    it('should create cache file when it does not exist', async () => {
      const CACHE_FILE = 'test-file.json';
      const TEST_CONTENT = 'expected test content';

      const existsSyncFn = jest.spyOn(fs, 'existsSync');
      existsSyncFn.mockReturnValue(false);

      await new Cache<string>(CACHE_FILE).set(TEST_CONTENT);

      expect(mkdirP).toHaveBeenCalled();
    });

    it('should return cached content when cache exists', async () => {
      const CACHE_FILE = 'test-file.json';
      const EXPECTED_CONTENT = { id: 'expected test content' };

      const testCache = new Cache(CACHE_FILE);

      const existsSyncFn = jest.spyOn(fs, 'existsSync');
      const readFileSyncFn = jest.spyOn(fs, 'readFileSync');

      existsSyncFn.mockReturnValue(true);
      readFileSyncFn.mockReturnValue(JSON.stringify(EXPECTED_CONTENT));

      await testCache.set(EXPECTED_CONTENT);

      const result = testCache.get();

      expect(result).toStrictEqual(EXPECTED_CONTENT);
    });

    it('should return undefined when no content is cached', () => {
      const fileName = 'test-file.json';
      const testCache = new Cache<string>(fileName);

      const result = testCache.get();

      expect(result).toBeUndefined();
    });
  });
});

describe('createCache', () => {
  it('should create a new Cache instance with the provided name', () => {
    const fileName = 'test-file.json';
    const cache = createCache<string>(fileName);

    expect(cache).toBeInstanceOf(Cache);
    expect(cache.name).toBe(fileName);
  });
});
