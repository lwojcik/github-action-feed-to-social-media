import {
  postToSocialMedia,
  stripHTML,
  isFeedItemNewer,
  convertArrayToObject,
} from '../src/helpers';
import { postToTwitter } from '../src/services/twitter';
import { postToMastodon } from '../src/services/mastodon';
import { updateMastodonMetadata } from '../src/services/mastodon-metadata';
import { postToDiscord } from '../src/services/discord';
import { postToSlack } from '../src/services/slack';
import { FeedItem, SocialService, PostSubmitStatus } from '../src/types';

jest.mock('../src/services/twitter');
jest.mock('../src/services/mastodon');
jest.mock('../src/services/mastodon-metadata');
jest.mock('../src/services/discord');
jest.mock('../src/services/slack');

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

describe('stripHTML', () => {
  it('removes HTML tags from the content', () => {
    const content = '<p>Hello, <b>World!</b></p>';
    const result = stripHTML(content);
    expect(result).toBe('Hello, World!');
  });

  it('returns the original content if there are no HTML tags', () => {
    const content = 'Hello, World!';
    const result = stripHTML(content);
    expect(result).toBe(content);
  });
});

describe('convertArrayToObject', () => {
  it('should convert the array to an object', () => {
    const array = [
      { mastodon: 'skipped' },
      { mastodonMetadata: 'skipped' },
      { twitter: 'skipped' },
      { discord: 'skipped' },
      { slack: 'skipped' },
    ] as {
      [key: string]: string;
    }[];

    const result = convertArrayToObject(array);

    expect(result).toEqual({
      mastodon: 'skipped',
      mastodonMetadata: 'skipped',
      twitter: 'skipped',
      discord: 'skipped',
      slack: 'skipped',
    });
  });

  it('should return an empty object when given an empty array', () => {
    const array: { [key: string]: string }[] = [];
    const result = convertArrayToObject(array);

    expect(result).toEqual({});
  });

  it('should handle duplicate keys by overwriting the previous value', () => {
    const array = [{ key: 'value1' }, { key: 'value2' }, { key: 'value3' }];

    const result = convertArrayToObject(array);

    expect(result).toEqual({ key: 'value3' });
  });
});

describe('isFeedItemNewer', () => {
  it('returns true if the feed item is newer than the cached item', () => {
    const feedItem = {
      published: new Date('2023-06-11'),
    } as unknown as FeedItem;
    const cachedItem = {
      published: new Date('2023-06-10'),
    } as unknown as FeedItem;
    const result = isFeedItemNewer({ feedItem, cachedItem });
    expect(result).toBe(true);
  });

  it('returns false if the feed item is older than or equal to the cached item', () => {
    const feedItem = {
      published: new Date('2023-06-10'),
    } as unknown as FeedItem;
    const cachedItem = {
      published: new Date('2023-06-11'),
    } as unknown as FeedItem;
    const result = isFeedItemNewer({ feedItem, cachedItem });
    expect(result).toBe(false);
  });

  it('returns false if either the feed item or the cached item is not provided', () => {
    const feedItem = {
      published: new Date('2023-06-10'),
    } as unknown as FeedItem;
    const result1 = isFeedItemNewer({ feedItem });
    const result2 = isFeedItemNewer({});
    expect(result1).toBe(false);
    expect(result2).toBe(false);
  });
});

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

  it('sends empty string to updateMastodonMetadata if title is not provided', () => {
    const params = {
      type: SocialService.mastodonMetadata,
      content: {
        title: '',
        link: 'link',
      } as FeedItem,
    };
    postToSocialMedia(params);
    expect(updateMastodonMetadata).toHaveBeenCalledWith(
      expect.stringContaining('')
    );
  });

  it('sends empty string to updateMastodonMetadata if link is not provided', () => {
    const params = {
      type: SocialService.mastodonMetadata,
      content: {
        title: 'sample title',
        link: '',
      } as FeedItem,
    };
    postToSocialMedia(params);
    expect(updateMastodonMetadata).toHaveBeenCalledWith(
      expect.stringContaining('')
    );
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

  it('throws an error for an unknown social media type', () => {
    const params = {
      type: 'unknown' as SocialService,
      content: mockContent as FeedItem,
    };
    expect(() => postToSocialMedia(params)).toThrow();
  });

  it('returns skipped status if both title and link are empty', () => {
    const params = {
      type: SocialService.twitter,
      content: { title: '', link: '' } as FeedItem,
    };
    const result = postToSocialMedia(params);
    expect(result).toBe(PostSubmitStatus.skipped);
  });
});
