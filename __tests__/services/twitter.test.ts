import { Twitter, postToTwitter } from '../../src/services/twitter';
import { PostSubmitStatus } from '../../src/types';
import { config } from '../../src/config';
import { TwitterApi } from 'twitter-api-v2';

jest.mock('twitter-api-v2');

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

jest.mock('path', () => ({
  join: (name: string) => name,
}));

describe('Twitter', () => {
  describe('post', () => {
    it('should return skipped if content looks empty', async () => {
      const instance = new Twitter({
        apiKey: 'test-api-key',
        apiKeySecret: 'test-api-key-secret',
        accessToken: 'test-access-token',
        accessTokenSecret: 'test-access-token-secret',
      });

      const result = await instance.post('');

      expect(result).toBe(PostSubmitStatus.skipped);
    });

    it('should return disabled if posting to Mastodon is disabled', async () => {
      config.SOCIAL_MEDIA.SERVICES_TO_UPDATE.twitter = false;

      const instance = new Twitter({
        apiKey: 'test-api-key',
        apiKeySecret: 'test-api-key-secret',
        accessToken: 'test-access-token',
        accessTokenSecret: 'test-access-token-secret',
      });

      const result = await instance.post('test-content');

      expect(result).toBe(PostSubmitStatus.disabled);
    });

    it('should return notConfigured if Twitter configuration is incomplete', async () => {
      config.SOCIAL_MEDIA.SERVICES_TO_UPDATE.twitter = true;

      const instance = new Twitter({
        apiKey: '',
        apiKeySecret: '',
        accessToken: '',
        accessTokenSecret: '',
      });

      const result = await instance.post('Test content');

      expect(result).toBe(PostSubmitStatus.notConfigured);
    });

    it('should return PostSubmitStatus.errored if an error occurs', async () => {
      (TwitterApi as any).mockRejectedValue(new Error('API error'));

      const instance = new Twitter({
        apiKey: 'test-api-key',
        apiKeySecret: 'test-api-key-secret',
        accessToken: 'test-access-token',
        accessTokenSecret: 'test-access-token-secret',
      });

      const result = await instance.post('content');

      expect(result).toBe(PostSubmitStatus.errored);
    });

    it('should post content to Twitter and return the posted status URL', async () => {
      config.SOCIAL_MEDIA.SERVICES_TO_UPDATE.twitter = true;

      const tweetMock = jest.fn().mockImplementation(() => ({
        data: {
          id: '123',
        },
      }));
      const twitterApiMock = (jest.requireMock('twitter-api-v2') as any)
        .TwitterApi;
      twitterApiMock.mockResolvedValue({
        v2: { tweet: tweetMock },
      });

      const instance = new Twitter({
        apiKey: 'test-api-key',
        apiKeySecret: 'test-api-key-secret',
        accessToken: 'test-access-token',
        accessTokenSecret: 'test-access-token-secret',
      });

      const result = await instance.post('Test content');

      expect(result).toBe('https://twitter.com/twitter/status/123');
    });
  });
});

describe('postToTwitter', () => {
  it('should create an instance of Twitter and call post', async () => {
    const mockUpdate = jest
      .spyOn(Twitter.prototype as any, 'post')
      .mockResolvedValue(PostSubmitStatus.updated);

    const content = 'content';
    const result = await postToTwitter(content);

    expect(result).toBe(PostSubmitStatus.updated);
    expect(mockUpdate).toHaveBeenCalledWith(content);
  });
});
