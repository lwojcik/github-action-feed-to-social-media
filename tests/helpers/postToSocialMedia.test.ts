import { postToSocialMedia } from '../../src/helpers/postToSocialMedia';
import { postToTwitter } from '../../src/services/twitter';
import { postToMastodon } from '../../src/services/mastodon';
import { updateMastodonMetadata } from '../../src/services/mastodon-metadata';
import { postToDiscord } from '../../src/services/discord';
import { postToSlack } from '../../src/services/slack';
import { postToBluesky } from '../../src/services/bluesky';
import { FeedItem, SocialService } from '../../src/types';

jest.mock('../../src/services/twitter');
jest.mock('../../src/services/mastodon');
jest.mock('../../src/services/mastodon-metadata');
jest.mock('../../src/services/discord');
jest.mock('../../src/services/slack');
jest.mock('../../src/services/bluesky');

jest.mock('@actions/core', () => ({
  info: () => jest.fn(),
  debug: () => jest.fn(),
  warning: () => jest.fn(),
  notice: () => jest.fn(),
  getInput: (key: string) => {
    const MOCKED_CONFIG = {
      feedUrl: 'https://test-feed-url/',
      postFormat: '{title} {link}',
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

describe('postToSocialMedia', () => {
  const mockContent = {
    title: 'Test Post',
    link: 'https://example.com/test-post',
  };

  it('posts to Twitter when the social media type is Twitter', () => {
    const params = {
      type: SocialService.twitter,
      content: mockContent as FeedItem,
    };
    postToSocialMedia(params);
    expect(postToTwitter).toHaveBeenCalledWith(
      expect.stringContaining('Test Post')
    );
  });

  it('posts to Mastodon when the social media type is Mastodon', () => {
    const params = {
      type: SocialService.mastodon,
      content: mockContent as FeedItem,
    };
    postToSocialMedia(params);
    expect(postToMastodon).toHaveBeenCalledWith(
      expect.stringContaining('Test Post')
    );
  });

  it('updates Mastodon metadata when the social media type is MastodonMetadata', () => {
    const params = {
      type: SocialService.mastodonMetadata,
      content: mockContent as FeedItem,
    };
    postToSocialMedia(params);
    expect(updateMastodonMetadata).toHaveBeenCalledWith(
      'https://example.com/test-post'
    );
  });

  it('skips updating Mastodon metadata if link is empty', () => {
    const params = {
      type: SocialService.mastodonMetadata,
      content: {
        title: 'Test Post',
        link: '',
      } as FeedItem,
    };
    postToSocialMedia(params);
    expect(updateMastodonMetadata).toHaveBeenCalledWith('');
  });

  it('posts to Discord when the social media type is Discord', () => {
    const params = {
      type: SocialService.discord,
      content: mockContent as FeedItem,
    };
    postToSocialMedia(params);
    expect(postToDiscord).toHaveBeenCalledWith(
      expect.stringContaining('Test Post')
    );
  });

  it('posts to Slack when the social media type is Slack', () => {
    const params = {
      type: SocialService.slack,
      content: mockContent as FeedItem,
    };
    postToSocialMedia(params);
    expect(postToSlack).toHaveBeenCalledWith(
      expect.stringContaining('Test Post')
    );
  });

  it('posts to Bluesky when the social media type is Bluesky', () => {
    const params = {
      type: SocialService.bluesky,
      content: mockContent as FeedItem,
    };
    postToSocialMedia(params);
    expect(postToBluesky).toHaveBeenCalledWith(
      expect.stringContaining('Test Post')
    );
  });

  it('throws an error for an unknown social media type', () => {
    const params = {
      type: 'unknown' as SocialService,
      content: mockContent as FeedItem,
    };
    expect(() => postToSocialMedia(params)).toThrow();
  });
});
