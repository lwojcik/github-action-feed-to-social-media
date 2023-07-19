import { FeedItem, SocialService } from '../types';
import { updateMastodonMetadata } from '../services/mastodon-metadata';
import { postToDiscord } from '../services/discord';
import { postToSlack } from '../services/slack';
import { postToTwitter } from '../services/twitter';
import { postToMastodon } from '../services/mastodon';
import { config } from '../config';
import { formatPostContent } from './formatPostContent';
import { logger } from '../logger';

export const postToSocialMedia = (params: {
  type: SocialService;
  content: FeedItem;
}) => {
  const { content, type } = params;
  const { link } = params.content;
  const { POST_FORMAT } = config;

  if (!link) {
    logger.notice(
      'Post link is empty. If you enabled Mastodon metadata update, it will not be triggered.'
    );
  }

  const formattedPost = formatPostContent(content, POST_FORMAT);

  switch (type) {
    case SocialService.mastodon:
      return postToMastodon(formattedPost);
    case SocialService.mastodonMetadata:
      return updateMastodonMetadata(link || '');
    case SocialService.twitter:
      return postToTwitter(formattedPost);
    case SocialService.discord:
      return postToDiscord(formattedPost);
    case SocialService.slack:
      return postToSlack(formattedPost);
    default:
      throw new Error(
        `Unknown social media type: '${type}'. Available types: ${Object.keys(
          SocialService
        )}`
      );
  }
};
