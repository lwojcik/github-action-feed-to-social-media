import { TwitterApi } from 'twitter-api-v2';
import { config } from '../config';
import {
  PostSubmitStatus,
  SocialMediaService,
  SocialService,
  TwitterSettings,
} from '../types';
import { logger } from '../logger';

export class Twitter implements SocialMediaService {
  private readonly apiKey: string;
  private readonly apiKeySecret: string;
  private readonly accessToken: string;
  private readonly accessTokenSecret: string;

  constructor(params: TwitterSettings) {
    this.apiKey = params.apiKey;
    this.apiKeySecret = params.apiKeySecret;
    this.accessToken = params.accessToken;
    this.accessTokenSecret = params.accessTokenSecret;
  }

  private validateConfig() {
    return (
      this.apiKey.length > 0 &&
      this.apiKeySecret.length > 0 &&
      this.accessToken.length > 0 &&
      this.accessTokenSecret.length > 0
    );
  }

  private async getClient() {
    return new TwitterApi({
      appKey: this.apiKey,
      appSecret: this.apiKeySecret,
      accessToken: this.accessToken,
      accessSecret: this.accessTokenSecret,
    });
  }

  async post(content: string) {
    if (!config.SOCIAL_MEDIA.SERVICES_TO_UPDATE.twitter) {
      logger.warning('Posting to Twitter is disabled. Skipping...');
      return PostSubmitStatus.disabled;
    }

    if (!content) {
      logger.warning('Post content is empty. Skipping...');
      return PostSubmitStatus.skipped;
    }

    if (!this.validateConfig()) {
      logger.warning(`Twitter configuration incomplete. Skipping...`);
      return PostSubmitStatus.notConfigured;
    }

    logger.info('Posting to Twitter...');

    try {
      const client = await this.getClient();

      const postedStatus = await client.v2.tweet(content);

      const twitterStatusUrl = 'https://twitter.com/twitter/status';
      const tweetId = postedStatus.data.id;

      return `${twitterStatusUrl}/${tweetId}`;
    } catch (error) {
      if (error instanceof Error) logger.warning(error.message);
      return PostSubmitStatus.errored;
    }
  }
}

export const postToTwitter = async (content: string) => {
  const settings = config.SOCIAL_MEDIA[SocialService.twitter];
  return new Twitter(settings).post(content);
};
