import { FeedEntry, extract, ReaderOptions } from '@extractus/feed-extractor';
import { FeedItem, NewestItemStrategy } from './types';
import { logger } from './helpers';

export class Feed {
  url: string;
  strategy: NewestItemStrategy;

  private items: FeedItem[] | undefined;

  constructor(url: string, strategy = NewestItemStrategy.latestDate) {
    logger.info(`Setting up feed: ${url}`);
    logger.info(`Using newest item strategy: ${strategy}`);

    this.url = url;
    this.strategy = strategy;
    this.items = undefined;
  }

  private async extract() {
    logger.debug(`Extracting feed: ${this.url}`);

    const parserOptions = {
      descriptionMaxLen: 999999,
      xmlParserOptions: {
        ignoreAttributes: false,
        allowBooleanAttributes: true,
      },
      getExtraEntryFields: (feedEntry: Record<string, any>) => {
        return {
          ...feedEntry,
          enclosure: feedEntry.enclosure
            ? {
                url: feedEntry.enclosure['@_url'] || undefined,
                type: feedEntry.enclosure['@_type'] || undefined,
                length: feedEntry.enclosure['@_length'] || undefined,
              }
            : undefined,
          category: feedEntry.category
            ? {
                text: feedEntry.category['@_text'] || undefined,
              }
            : undefined,
          'itunes:image': feedEntry['itunes:image']
            ? {
                href: feedEntry['itunes:image']['@_href'] || undefined,
              }
            : undefined,
          guid: feedEntry.guid
            ? {
                isPermaLink: feedEntry.guid['@_isPermaLink'] === 'true',
                text: feedEntry.guid['#text'] || undefined,
              }
            : undefined,
        };
      },
    } as ReaderOptions;

    this.items = (await extract(this.url, parserOptions))
      .entries as unknown as FeedItem[];
    return this.items;
  }

  private async getItems() {
    if (!this.items) {
      await this.extract();
    }

    /* istanbul ignore next */
    return this.items?.map((entry) => ({
      ...entry,
      published: entry.published ? new Date(entry.published).getTime() : 0,
    }));
  }

  private getItemByStrategy = (
    items: FeedItem[],
    strategy: NewestItemStrategy
  ) => {
    switch (strategy) {
      case NewestItemStrategy.first:
        return items[0];
      case NewestItemStrategy.last:
        return items[items.length - 1];
      case NewestItemStrategy.latestDate:
        return items.sort(
          (first: FeedItem, second: FeedItem) =>
            second.published - first.published
        )[0];
      default:
        throw new Error(
          `Unknown newestItemStrategy '${this.strategy}'. Available options: '${NewestItemStrategy.first}', '${NewestItemStrategy.last}' or '${NewestItemStrategy.latestDate}'`
        );
    }
  };

  async getLatestItem() {
    logger.info(`Obtaining latest feed item...`);

    const items = await this.getItems();

    if (items) {
      const latestItem = this.getItemByStrategy(items, this.strategy);
      logger.debug(`Newest item: ${JSON.stringify(latestItem)}`);
      return latestItem;
    }

    logger.warning('Feed is empty!');
    return undefined;
  }
}

export const fetchLatestFeedItem = (
  url: string,
  strategy: NewestItemStrategy
) => new Feed(url, strategy).getLatestItem();
