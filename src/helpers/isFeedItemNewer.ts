import { FeedItem } from '../types';

export const isFeedItemNewer = ({
  feedItem,
  cachedItem,
}: {
  feedItem?: FeedItem;
  cachedItem?: FeedItem;
}) => {
  if (feedItem && cachedItem) {
    return feedItem.published > cachedItem.published;
  }

  return false;
};
