import { FeedItem, SocialService } from '../types';
import { updateMastodonMetadata } from '../services/mastodon-metadata';
import { postToDiscord } from '../services/discord';
import { postToSlack } from '../services/slack';
import { postToTwitter } from '../services/twitter';
import { postToMastodon } from '../services/mastodon';
import { postToBluesky } from '../services/bluesky';
import { config } from '../config';
import { formatPostContent } from './formatPostContent';
import { logger } from '../logger';

export const postToSocialMedia = (params: {
  type: SocialService;
  content: FeedItem;
}) => {
  const { content, type } = params;
  const { link } = params.content;
  const { POST_FORMAT, SOCIAL_MEDIA } = config;

  if (!link) {
    logger.notice(
      'Post link is empty. If you enabled Mastodon metadata update, it will not be triggered.'
    );
  }

  switch (type) {
    case SocialService.mastodon: {
      const mastodonPost = formatPostContent(
        content,
        SOCIAL_MEDIA.mastodon.postFormat || POST_FORMAT
      );
      return postToMastodon(mastodonPost);
    }

    case SocialService.mastodonMetadata:
      return updateMastodonMetadata(link || '');

    case SocialService.twitter: {
      const twitterPost = formatPostContent(
        content,
        SOCIAL_MEDIA.twitter.postFormat || POST_FORMAT
      );
      return postToTwitter(twitterPost);
    }

    case SocialService.discord: {
      const post = formatPostContent(
        content,
        SOCIAL_MEDIA.discord.postFormat || POST_FORMAT
      );
      return postToDiscord(post);
    }

    case SocialService.slack: {
      const slackPost = formatPostContent(
        content,
        SOCIAL_MEDIA.slack.postFormat || POST_FORMAT
      );
      return postToSlack(slackPost);
    }

    case SocialService.bluesky: {
      const blueskyPost = formatPostContent(
        content,
        SOCIAL_MEDIA.bluesky.postFormat || POST_FORMAT
      );
      return postToBluesky(blueskyPost);
    }

    default:
      throw new Error(
        `Unknown social media type: '${type}'. Available types: ${Object.keys(
          SocialService
        )}`
      );
  }
};
