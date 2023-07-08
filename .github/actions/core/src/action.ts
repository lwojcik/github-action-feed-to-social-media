import { setFailed, setOutput } from '@actions/core';
import { config } from './config';
import { createCache } from './cache';
import { fetchLatestFeedItem } from './feed';
import {
  ActionOutput,
  FeedItem,
  PostSubmitStatus,
  SocialService,
} from './types';
import { logger } from './logger';
import {
  convertArrayToObject,
  isFeedItemNewer,
  postToSocialMedia,
} from './helpers';

export const runAction = async () => {
  try {
    const { FEED_URL, LATEST_ITEM_STRATEGY, CACHE_FILE_NAME, SOCIAL_MEDIA } =
      config;

    const servicesToUpdate = Object.keys(
      SOCIAL_MEDIA.SERVICES_TO_UPDATE
    ) as SocialService[];

    const feedItem = await fetchLatestFeedItem(FEED_URL, LATEST_ITEM_STRATEGY);

    logger.debug(JSON.stringify(feedItem));

    if (!feedItem) {
      logger.warning('No feed item to fetch!');

      const skippedStatuses = servicesToUpdate.map((service) => ({
        [service]: PostSubmitStatus.skipped,
      }));

      const outputObject = convertArrayToObject(skippedStatuses);

      setOutput(ActionOutput.updateStatus, JSON.stringify(outputObject));

      return;
    }

    const cache = createCache(CACHE_FILE_NAME);

    const cachedItem = cache.get<FeedItem>();

    if (cachedItem) {
      logger.debug('Cached item:');
      logger.debug(JSON.stringify(cachedItem as FeedItem));
    } else {
      logger.debug('No cached item found!');
    }

    const shouldPost = isFeedItemNewer({ feedItem, cachedItem });

    if (shouldPost) {
      logger.info('New feed item detected. Attempting to post it...');

      const postStatuses = servicesToUpdate.map(async (service) => ({
        [service]: await postToSocialMedia({
          type: service,
          content: feedItem,
        }),
      }));

      const allSocialsUpdates = await Promise.all(postStatuses);
      const outputObject = convertArrayToObject(allSocialsUpdates);

      logger.info(`Updating cache with new feed item...`);
      await cache.set(feedItem);

      setOutput(ActionOutput.updateStatus, JSON.stringify(outputObject));

      return;
    }

    const skippedStatuses = servicesToUpdate.map((service) => ({
      [service]: PostSubmitStatus.skipped,
    }));

    if (!cachedItem) {
      logger.info(`Populating empty cache with fetched feed item...`);
      await cache.set(feedItem);
    } else {
      logger.info('No new feed item detected. Exiting...');
    }

    const finalObject = convertArrayToObject(skippedStatuses);

    setOutput(ActionOutput.updateStatus, JSON.stringify(finalObject));

    return;
  } catch (error) {
    if (error instanceof Error) setFailed(error.message);
    return;
  }
};
