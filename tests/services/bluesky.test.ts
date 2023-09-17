import { Bluesky, postToBluesky } from '../../src/services/bluesky';
import { config } from '../../src/config';
import { PostSubmitStatus } from '../../src/types';

jest.mock('../../src/config');

jest.mock('../../src/logger', () => ({
  logger: {
    info: jest.fn(),
    warning: jest.fn(),
  },
}));

jest.mock('easy-bsky-bot-sdk');

jest.mock('@actions/core', () => ({
  info: () => jest.fn(),
  debug: () => jest.fn(),
  warning: () => jest.fn(),
  notice: () => jest.fn(),
  getInput: (key: string) => {
    const MOCKED_CONFIG = {
      feedUrl: 'https://test-feed-url/',
    } as {
      [key: string]: string;
    };

    return MOCKED_CONFIG[key];
  },
  getBooleanInput: () => jest.fn(),
}));

describe('Bluesky', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a Bluesky instance with valid configuration', () => {
    const bluesky = new Bluesky({
      handle: 'valid.handle',
      appPassword: 'valid.password',
      ownerHandle: 'valid.ownerHandle',
      ownerContact: 'valid.ownerContact',
    });

    expect(bluesky).toBeInstanceOf(Bluesky);
  });

  it('should post to Bluesky and return updated status', async () => {
    const bluesky = new Bluesky({
      handle: 'valid.handle',
      appPassword: 'valid.password',
      ownerHandle: 'valid.ownerHandle',
      ownerContact: 'valid.ownerContact',
    });

    const status = await bluesky.post('Test content');

    expect(status).toBe(PostSubmitStatus.updated);
  });

  it('should disable posting to Bluesky if posting to Bluesky is disabled', async () => {
    config.SOCIAL_MEDIA.SERVICES_TO_UPDATE.bluesky = false;

    const bluesky = new Bluesky({
      handle: 'valid.handle',
      appPassword: 'valid.password',
      ownerHandle: 'valid.ownerHandle',
      ownerContact: 'valid.ownerContact',
    });

    const status = await bluesky.post('Test content');

    expect(status).toBe(PostSubmitStatus.disabled);
  });

  it('should return notConfigured when Bluesky configuration is incomplete', async () => {
    config.SOCIAL_MEDIA.SERVICES_TO_UPDATE.bluesky = true;

    const bluesky = new Bluesky({
      handle: '',
      appPassword: '',
      ownerHandle: '',
      ownerContact: '',
    });

    const status = await bluesky.post('Test content');

    expect(status).toBe(PostSubmitStatus.notConfigured);
  });

  it('should return errored when an error occurs while posting', async () => {
    config.SOCIAL_MEDIA.SERVICES_TO_UPDATE.bluesky = true;

    const bluesky = new Bluesky({
      handle: 'valid.handle',
      appPassword: 'valid.password',
      ownerHandle: 'valid.ownerHandle',
      ownerContact: 'valid.ownerContact',
    });

    (bluesky as any).getClient = jest.fn(() => {
      throw new Error('Test error');
    });

    const status = await bluesky.post('Test content');

    expect(status).toBe(PostSubmitStatus.errored);
  });
});

describe('postToBluesky', () => {
  it('should create an instance of Bluesky and call post', async () => {
    const mockUpdate = jest
      .spyOn(Bluesky.prototype as any, 'post')
      .mockResolvedValue(PostSubmitStatus.updated);

    const content = 'content';
    const result = await postToBluesky(content);

    expect(result).toBe(PostSubmitStatus.updated);
    expect(mockUpdate).toHaveBeenCalledWith(content);
  });
});
