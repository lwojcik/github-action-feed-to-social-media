import axios from 'axios';
import { config } from '../config';
import { PostSubmitStatus, SocialMediaService, SocialService } from '../types';
import { logger } from '../helpers';

export class Discord implements SocialMediaService {
  private readonly webhookUrl: string;

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl;
  }

  private validateConfig() {
    return this.webhookUrl.length > 0;
  }

  async post(content: string) {
    if (!config.SOCIAL_MEDIA.SERVICES_TO_UPDATE.discord) {
      logger.warning('Posting to Discord is disabled. Skipping...');
      return PostSubmitStatus.disabled;
    }

    if (!this.validateConfig()) {
      logger.warning(`Discord configuration incomplete. Skipping...`);
      return PostSubmitStatus.notConfigured;
    }

    logger.info('Posting to Discord...');

    try {
      await axios.post(this.webhookUrl, { content });

      return PostSubmitStatus.updated;
    } catch (error) {
      if (error instanceof Error) logger.warning(error.message);
      return PostSubmitStatus.errored;
    }
  }
}

export const postToDiscord = async (content: string) => {
  const { webhookUrl } = config.SOCIAL_MEDIA[SocialService.discord];
  return new Discord(webhookUrl).post(content);
};
