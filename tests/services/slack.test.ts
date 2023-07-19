import axios from 'axios';
import { Slack, postToSlack } from '../../src/services/slack';
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

describe('Slack', () => {
  describe('post', () => {
    it('should return "disabled" if posting to Slack is disabled', async () => {
      config.SOCIAL_MEDIA.SERVICES_TO_UPDATE.slack = false;

      const slack = new Slack('webhook-url');
      const result = await slack.post('content');

      expect(result).toBe(PostSubmitStatus.disabled);
    });

    it('should return "notConfigured" if Slack configuration is incomplete', async () => {
      config.SOCIAL_MEDIA.SERVICES_TO_UPDATE.slack = true;

      const slack = new Slack('');
      const result = await slack.post('content');

      expect(result).toBe(PostSubmitStatus.notConfigured);
    });

    it('should return "updated" if the post is successfully submitted', async () => {
      config.SOCIAL_MEDIA.SERVICES_TO_UPDATE.slack = true;

      const slack = new Slack('webhook-url');
      (axios.post as any).mockImplementationOnce(() => Promise.resolve({}));

      const result = await slack.post('content');

      expect(result).toBe(PostSubmitStatus.updated);
    });

    it('should return "errored" if an error occurs during the post', async () => {
      config.SOCIAL_MEDIA.SERVICES_TO_UPDATE.slack = true;

      const slack = new Slack('webhook-url');
      const error = new Error('Post failed');
      (axios.post as any).mockImplementationOnce(() => Promise.reject(error));

      const result = await slack.post('content');

      expect(result).toBe(PostSubmitStatus.errored);
      3;
    });
  });
});

describe('postToSlack', () => {
  it('should call Slack class with the correct parameters', async () => {
    const slackInstance = {
      post: jest
        .fn()
        .mockImplementation(() => Promise.resolve(PostSubmitStatus.updated)),
    };
    const SlackMock = jest.fn().mockImplementation(() => slackInstance);
    jest.mock('../../src/services/slack', () => ({ Slack: SlackMock }));

    config.SOCIAL_MEDIA[SocialService.slack] = {
      webhookUrl: 'webhook-url',
    } as (typeof config.SOCIAL_MEDIA)[SocialService.slack];

    const result = await postToSlack('content');

    expect(result).toBe(PostSubmitStatus.updated);
  });
});
