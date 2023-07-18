import { isFeedItemNewer } from '../../src/helpers/isFeedItemNewer';
import { FeedItem } from '../../src/types';

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
