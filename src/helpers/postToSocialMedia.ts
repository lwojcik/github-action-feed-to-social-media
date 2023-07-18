import { FeedItem, PostSubmitStatus, SocialService } from '../types';
import { logger } from './logger';
import { updateMastodonMetadata } from '../services/mastodon-metadata';
import { postToDiscord } from '../services/discord';
import { postToSlack } from '../services/slack';
import { postToTwitter } from '../services/twitter';
import { postToMastodon } from '../services/mastodon';
import { config } from '../config';
import { formatPostContent } from './formatPostContent';

export const postToSocialMedia = (params: {
  type: SocialService;
  content: FeedItem;
}) => {
  const { content, type } = params;
  const { title, link } = params.content;
  const { POST_FORMAT } = config;

  console.log(POST_FORMAT);

  if (!title && !link) {
    logger.notice('Both post title and link are empty. Skipping...');
    return Promise.resolve(PostSubmitStatus.skipped);
  }

  const postContent = formatPostContent(
    content,
    POST_FORMAT
  ) as unknown as string;

  console.log(postContent);

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
