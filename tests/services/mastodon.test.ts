import { login } from 'masto';
import { Mastodon, postToMastodon } from '../../src/services/mastodon';
import {
  MastodonPostVisibilitySetting,
  PostSubmitStatus,
} from '../../src/types';
import { config } from '../../src/config';

jest.mock('masto');

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

describe('Mastodon', () => {
  describe('post', () => {
    it('should return skipped if content looks empty', async () => {
      const instance = new Mastodon({
        accessToken: 'token',
        instance: 'instance',
        postVisibility: MastodonPostVisibilitySetting.public,
      });
      const result = await instance.post('');

      expect(result).toBe(PostSubmitStatus.skipped);
    });

    it('should return disabled if posting to Mastodon is disabled', async () => {
      config.SOCIAL_MEDIA.SERVICES_TO_UPDATE.mastodon = false;

      const instance = new Mastodon({
        accessToken: 'token',
        instance: 'instance',
        postVisibility: MastodonPostVisibilitySetting.public,
      });
      const result = await instance.post('');

      expect(result).toBe(PostSubmitStatus.disabled);
    });

    it('should return notConfigured if Mastodon configuration is incomplete', async () => {
      config.SOCIAL_MEDIA.SERVICES_TO_UPDATE.mastodon = true;

      const instance = new Mastodon({
        accessToken: '',
        instance: '',
        postVisibility: MastodonPostVisibilitySetting.public,
      });

      const result = await instance.post('Test content');

      expect(result).toBe(PostSubmitStatus.notConfigured);
    });

    it('should return PostSubmitStatus.errored if an error occurs', async () => {
      (login as any).mockRejectedValue(new Error('API error'));

      const instance = new Mastodon({
        accessToken: 'token',
        instance: 'instance',
        postVisibility: MastodonPostVisibilitySetting.public,
      });
      const result = await instance.post('content');

      expect(result).toBe(PostSubmitStatus.errored);
    });

    it('should post content to Mastodon and return the posted status URL', async () => {
      config.SOCIAL_MEDIA.SERVICES_TO_UPDATE.mastodon = true;

      const createStatusMock = jest.fn().mockImplementation(() => ({
        url: 'https://mastodon.instance/status/123',
      }));
      const loginMock = (jest.requireMock('masto') as any).login;
      loginMock.mockResolvedValue({
        v1: { statuses: { create: createStatusMock } },
      });

      const instance = new Mastodon({
        accessToken: 'token',
        instance: 'instance',
        postVisibility: MastodonPostVisibilitySetting.public,
      });
      const result = await instance.post('Test content');

      expect(result).toBe('https://mastodon.instance/status/123');
    });
  });
});

describe('postToMastodon', () => {
  it('should create an instance of Mastodon and call post', async () => {
    const mockUpdate = jest
      .spyOn(Mastodon.prototype as any, 'post')
      .mockResolvedValue(PostSubmitStatus.updated);

    const content = 'content';
    const result = await postToMastodon(content);

    expect(result).toBe(PostSubmitStatus.updated);
    expect(mockUpdate).toHaveBeenCalledWith(content);
  });
});
