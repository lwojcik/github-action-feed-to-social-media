import { login } from 'masto';
import {
  MastodonMetadata,
  updateMastodonMetadata,
} from '../../src/services/mastodon-metadata';
import { config } from '../../src/config';
import { PostSubmitStatus } from '../../src/types';

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

describe('MastodonMetadata', () => {
  describe('update', () => {
    it('should return skipped if content looks empty', async () => {
      const instance = new MastodonMetadata({
        accessToken: 'token',
        instance: 'instance',
        fieldIndex: 0,
      });
      const result = await instance.update('');

      expect(result).toBe(PostSubmitStatus.skipped);
    });

    it('should return disabled if updating Mastodon metadata is disabled', async () => {
      config.SOCIAL_MEDIA.SERVICES_TO_UPDATE.mastodonMetadata = false;

      const instance = new MastodonMetadata({
        accessToken: 'token',
        instance: 'instance',
        fieldIndex: 0,
      });
      const result = await instance.update('Test content');

      expect(result).toBe(PostSubmitStatus.disabled);
    });

    it('should return notConfigured if Mastodon metadata configuration is incomplete', async () => {
      config.SOCIAL_MEDIA.SERVICES_TO_UPDATE.mastodonMetadata = true;

      const instance = new MastodonMetadata({
        accessToken: '',
        instance: '',
        fieldIndex: 0,
      });
      const result = await instance.update('Test content');

      expect(result).toBe(PostSubmitStatus.notConfigured);
    });

    it('should return PostSubmitStatus.skipped if existing profile metadata is empty', async () => {
      config.SOCIAL_MEDIA.SERVICES_TO_UPDATE.mastodonMetadata = true;

      const mockClient = {
        v1: {
          accounts: {
            verifyCredentials: jest.fn().mockImplementation(() => ({
              fields: [],
            })),
            updateCredentials: jest.fn(),
          },
        },
      };
      (login as any).mockResolvedValue(mockClient);

      const instance = new MastodonMetadata({
        accessToken: 'token',
        instance: 'instance',
        fieldIndex: 0,
      });
      const result = await instance.update('content');

      expect(result).toBe(PostSubmitStatus.skipped);
    });

    it('should return PostSubmitStatus.skipped if field index is out of range of existing profile metadata', async () => {
      config.SOCIAL_MEDIA.SERVICES_TO_UPDATE.mastodonMetadata = true;

      const mockClient = {
        v1: {
          accounts: {
            verifyCredentials: jest.fn().mockImplementation(() => ({
              fields: [
                {
                  name: 'test',
                  value: 'some-value',
                },
              ],
            })),
            updateCredentials: jest.fn(),
          },
        },
      };
      (login as any).mockResolvedValue(mockClient);

      const instance = new MastodonMetadata({
        accessToken: 'token',
        instance: 'instance',
        fieldIndex: 3,
      });
      const result = await instance.update('content');

      expect(result).toBe(PostSubmitStatus.skipped);
    });

    it('should return PostSubmitStatus.errored if an error occurs', async () => {
      (login as any).mockRejectedValue(new Error('API error'));

      const instance = new MastodonMetadata({
        accessToken: 'token',
        instance: 'instance',
        fieldIndex: 0,
      });
      const result = await instance.update('content');

      expect(result).toBe(PostSubmitStatus.errored);
    });

    it('should update Mastodon metadata and return PostSubmitStatus.updated', async () => {
      config.SOCIAL_MEDIA.SERVICES_TO_UPDATE.mastodonMetadata = true;

      const mockClient = {
        v1: {
          accounts: {
            verifyCredentials: jest.fn().mockImplementation(() => ({
              fields: [
                {
                  name: 'test',
                  value: 'some content',
                },
              ],
            })),
            updateCredentials: jest.fn(),
          },
        },
      };
      (login as any).mockResolvedValue(mockClient);

      const instance = new MastodonMetadata({
        accessToken: 'token',
        instance: 'instance',
        fieldIndex: 0,
      });
      const result = await instance.update('content');

      expect(result).toBe(PostSubmitStatus.updated);
    });
  });
});

describe('updateMastodonMetadata', () => {
  it('should create an instance of MastodonMetadata and call update', async () => {
    const mockUpdate = jest
      .spyOn(MastodonMetadata.prototype as any, 'update')
      .mockResolvedValue(PostSubmitStatus.updated);

    const content = 'content';
    const result = await updateMastodonMetadata(content);

    expect(result).toBe(PostSubmitStatus.updated);
    expect(mockUpdate).toHaveBeenCalledWith(content);
  });
});
