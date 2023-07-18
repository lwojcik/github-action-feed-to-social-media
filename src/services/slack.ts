import axios from 'axios';
import { config } from '../config';
import { PostSubmitStatus, SocialMediaService, SocialService } from '../types';
import { logger } from '../helpers';

export class Slack implements SocialMediaService {
  private readonly webhookUrl: string;

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl;
  }

  private validateConfig() {
    return this.webhookUrl.length > 0;
  }

  async post(content: string) {
    if (!config.SOCIAL_MEDIA.SERVICES_TO_UPDATE.slack) {
      logger.warning('Posting to Slack is disabled. Skipping...');
      return PostSubmitStatus.disabled;
    }

    if (!this.validateConfig()) {
      logger.warning(`Slack configuration incomplete. Skipping...`);
      return PostSubmitStatus.notConfigured;
    }

    logger.info('Posting to Slack...');

    try {
      await axios.post(this.webhookUrl, { text: content });

      return PostSubmitStatus.updated;
    } catch (error) {
      if (error instanceof Error) logger.warning(error.message);
      return PostSubmitStatus.errored;
    }
  }
}

export const postToSlack = async (content: string) => {
  const { webhookUrl } = config.SOCIAL_MEDIA[SocialService.slack];
  return new Slack(webhookUrl).post(content);
};
