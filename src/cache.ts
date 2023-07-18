import path from 'path';
import { mkdirP } from '@actions/io';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { config } from './config';
import { logger } from './logger';

export class Cache {
  name: string;
  private cacheDir: string;
  private cacheFilePath: string;

  constructor(name: string) {
    logger.info(`Establishing cache: ${name}`);

    this.name = name;
    this.cacheDir = path.join(process.cwd(), config.CACHE_DIRECTORY);
    this.cacheFilePath = path.join(this.cacheDir, this.name);
  }

  private cacheExists() {
    return existsSync(this.cacheFilePath);
  }

  private cacheDirExists() {
    return existsSync(this.cacheDir);
  }

  private async createCacheDir() {
    return mkdirP(this.cacheDir);
  }

  private readCache() {
    return readFileSync(this.cacheFilePath, {
      encoding: 'utf8',
      flag: 'r',
    });
  }

  private writeToCache(content: string) {
    writeFileSync(this.cacheFilePath, content, {
      encoding: 'utf8',
    });
  }

  get<T = unknown>() {
    if (this.cacheExists()) {
      logger.info(`Reading cache: ${this.name}`);

      const content = this.readCache();

      logger.debug(`Retrieved cached item title: ${JSON.stringify(content)}`);

      return JSON.parse(content) as T;
    }
    logger.warning(`Cache for ${this.name} is empty`);
    return undefined;
  }

  async set(content: Record<string, unknown>) {
    if (!this.cacheDirExists()) {
      logger.info(`Cache directory doesn't exist. Creating...`);
      await this.createCacheDir();
    }

    logger.info(`Saving to cache: ${this.name}`);

    this.writeToCache(JSON.stringify(content));
  }
}

export const createCache = (fileName: string) => new Cache(fileName);
