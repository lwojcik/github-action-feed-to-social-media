import { postToTwitter } from './services/twitter';
import { postToMastodon } from './services/mastodon';
import { FeedItem, PostSubmitStatus, SocialService } from './types';
import { config } from './config';
import { updateMastodonMetadata } from './services/mastodon-metadata';
import { postToDiscord } from './services/discord';
import { postToSlack } from './services/slack';
import { logger } from './logger';

export const stripHTML = (content: string) =>
  content.replace(/(<([^>]+)>)/gi, '');

export const convertArrayToObject = (
  arr: { [key: string]: string }[]
): { [key: string]: string } => {
  const result: { [key: string]: string } = {};

  for (const item of arr) {
    const key = Object.keys(item)[0];
    const value = Object.values(item)[0];
    result[key] = value;
  }

  return result;
};

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

export const postToSocialMedia = (params: {
  type: SocialService;
  content: FeedItem;
}) => {
  const { type } = params;
  const { title, link } = params.content;
  const { POST_FORMAT } = config;

  if (!title && !link) {
    logger.notice('Both post title and link are empty. Skipping...');
    return PostSubmitStatus.skipped;
  }

  const postContent = POST_FORMAT.replace('{title}', title || '').replace(
    '{link}',
    link || ''
  );

  switch (type) {
    case SocialService.mastodon:
      return postToMastodon(postContent);
    case SocialService.mastodonMetadata:
      return updateMastodonMetadata(link || '');
    case SocialService.twitter:
      return postToTwitter(postContent);
    case SocialService.discord:
      return postToDiscord(postContent);
    case SocialService.slack:
      return postToSlack(postContent);
    default:
      throw new Error(
        `Unknown social media type: '${type}'. Available types: ${Object.keys(
          SocialService
        )}`
      );
  }
};
