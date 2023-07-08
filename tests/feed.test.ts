import { Feed, fetchLatestFeedItem } from '../src/feed';
import { FeedItem, NewestItemStrategy } from '../src/types';
import { extract } from '@extractus/feed-extractor';

jest.mock('../src/logger', () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    warning: jest.fn(),
  },
}));

jest.mock('@extractus/feed-extractor', () => ({
  extract: () => undefined,
}));

describe('Feed', () => {
  describe('getLatestItem', () => {
    it('should use "latestDate" strategy when none is provided', async () => {
      const url = 'https://example.com/feed';

      const items = [
        { title: 'Item 1', published: 100 },
        { title: 'Item 2', published: 200 },
        { title: 'Item 3', published: 50 },
      ];
      const feed = new Feed(url);

      jest
        .spyOn(Feed.prototype as any, 'getItems')
        .mockResolvedValueOnce(items);

      const result = await feed.getLatestItem();

      expect(result).toEqual({ title: 'Item 2', published: 200 });
    });

    it('should throw when unknown strategy is provided', async () => {
      const url = 'https://example.com/feed';

      const items = [
        { title: 'Item 1', published: 100 },
        { title: 'Item 2', published: 200 },
        { title: 'Item 3', published: 50 },
      ];
      const feed = new Feed(url, 'wrongStrategy' as NewestItemStrategy);

      jest
        .spyOn(Feed.prototype as any, 'getItems')
        .mockResolvedValueOnce(items);

      await expect(feed.getLatestItem()).rejects.toThrow();
    });

    it('should return undefined when feed contains no items', async () => {
      const url = 'https://example.com/feed';
      const strategy = NewestItemStrategy.first;
      const items = [] as FeedItem[];

      (extract as any) = () => ({
        entries: items,
      });

      const feed = new Feed(url, strategy);

      const result = await feed.getLatestItem();

      expect(result).toBe(undefined);
    });

    it('should return undefined when feed is empty', async () => {
      const url = 'https://example.com/feed';
      const strategy = NewestItemStrategy.first;
      const items = [] as FeedItem[];

      (extract as any) = () => ({});

      const feed = new Feed(url, strategy);

      const result = await feed.getLatestItem();

      expect(result).toBe(undefined);
    });

    it('should return the first item when strategy is "first"', async () => {
      const url = 'https://example.com/feed';
      const strategy = NewestItemStrategy.first;
      const items = [
        { title: 'Item 1', published: 100 },
        { title: 'Item 2', published: 200 },
        { title: 'Item 3', published: 50 },
      ] as FeedItem[];
      const feed = new Feed(url, strategy);

      jest
        .spyOn(Feed.prototype as any, 'getItems')
        .mockResolvedValueOnce(items);

      const result = await feed.getLatestItem();

      expect(result).toBe(items[0]);
    });

    it('should return the last item when strategy is "last"', async () => {
      const url = 'https://example.com/feed';
      const strategy = NewestItemStrategy.last;
      const items = [
        { title: 'Item 1', published: 100 },
        { title: 'Item 2', published: 200 },
        { title: 'Item 3', published: 50 },
      ];
      const feed = new Feed(url, strategy);

      jest
        .spyOn(Feed.prototype as any, 'getItems')
        .mockResolvedValueOnce(items);

      const result = await feed.getLatestItem();

      expect(result).toBe(items[2]);
    });

    it('should return the item with the latest date when strategy is "latestDate"', async () => {
      const url = 'https://example.com/feed';
      const strategy = NewestItemStrategy.latestDate;
      const items = [
        { title: 'Item 1', published: 100 },
        { title: 'Item 2', published: 200 },
        { title: 'Item 3', published: 50 },
      ];
      const feed = new Feed(url, strategy);

      jest
        .spyOn(Feed.prototype as any, 'getItems')
        .mockResolvedValueOnce(items);

      const result = await feed.getLatestItem();

      expect(result).toEqual({ title: 'Item 2', published: 200 });
    });

    it('should return undefined and log a warning if feed items are empty', async () => {
      const url = 'https://example.com/feed';
      const strategy = NewestItemStrategy.latestDate;
      const items = [] as FeedItem[];
      const feed = new Feed(url, strategy);

      jest
        .spyOn(Feed.prototype as any, 'getItems')
        .mockResolvedValueOnce(items);

      const result = await feed.getLatestItem();

      expect(result).toBeUndefined();
    });
  });
});

describe('fetchLatestFeedItem', () => {
  it('should create a Feed instance with the provided URL and strategy, and call getLatestItem', async () => {
    const url = 'https://example.com/feed';
    const strategy = NewestItemStrategy.latestDate;
    const items = [
      {
        title: 'Latest Item 1',
        published: 20,
      },
      {
        title: 'Older item 2',
        published: 10,
      },
    ];

    jest.spyOn(Feed.prototype as any, 'getItems').mockResolvedValueOnce(items);
    jest.spyOn(Feed.prototype as any, 'getLatestItem');

    await fetchLatestFeedItem(url, strategy);

    expect(Feed.prototype.getLatestItem).toHaveBeenCalledTimes(1);
  });
});
