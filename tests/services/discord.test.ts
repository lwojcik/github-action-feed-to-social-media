import axios from 'axios';
import { Discord, postToDiscord } from '../../src/services/discord';
import { config } from '../../src/config';
import { PostSubmitStatus, SocialService } from '../../src/types';

jest.mock('axios');
jest.mock('../../src/config');
jest.mock('../../src/logger');

jest.mock('@actions/core', () => ({
  info: () => jest.fn(),
  debug: () => jest.fn(),
  warning: () => jest.fn(),
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

jest.mock('path', () => ({
  join: (name: string) => name,
}));

describe('Discord', () => {
  describe('post', () => {
    it('should return "disabled" if posting to Discord is disabled', async () => {
      config.SOCIAL_MEDIA.SERVICES_TO_UPDATE.discord = false;

      const discord = new Discord('webhook-url');
      const result = await discord.post('content');

      expect(result).toBe(PostSubmitStatus.disabled);
    });

    it('should return "notConfigured" if Discord configuration is incomplete', async () => {
      config.SOCIAL_MEDIA.SERVICES_TO_UPDATE.discord = true;

      const discord = new Discord('');
      const result = await discord.post('content');

      expect(result).toBe(PostSubmitStatus.notConfigured);
    });

    it('should return "updated" if the post is successfully submitted', async () => {
      config.SOCIAL_MEDIA.SERVICES_TO_UPDATE.discord = true;

      const discord = new Discord('webhook-url');
      (axios.post as any).mockImplementationOnce(() => Promise.resolve({}));

      const result = await discord.post('content');

      expect(result).toBe(PostSubmitStatus.updated);
    });

    it('should return "errored" if an error occurs during the post', async () => {
      config.SOCIAL_MEDIA.SERVICES_TO_UPDATE.discord = true;

      const discord = new Discord('webhook-url');
      const error = new Error('Post failed');
      (axios.post as any).mockImplementationOnce(() => Promise.reject(error));

      const result = await discord.post('content');

      expect(result).toBe(PostSubmitStatus.errored);
      3;
    });
  });
});

describe('postToDiscord', () => {
  it('should call Discord class with the correct parameters', async () => {
    const discordInstance = {
      post: jest
        .fn()
        .mockImplementation(() => Promise.resolve(PostSubmitStatus.updated)),
    };
    const DiscordMock = jest.fn().mockImplementation(() => discordInstance);
    jest.mock('../../src/services/discord', () => ({ Discord: DiscordMock }));

    config.SOCIAL_MEDIA[SocialService.discord] = {
      webhookUrl: 'webhook-url',
    } as (typeof config.SOCIAL_MEDIA)[SocialService.discord];

    const result = await postToDiscord('content');

    expect(result).toBe(PostSubmitStatus.updated);
  });
});
