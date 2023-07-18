import { login } from 'masto';
import { config } from '../config';
import {
  MastodonPostVisibilitySetting,
  MastodonSettings,
  PostSubmitStatus,
  PostedStatusUrl,
  SocialMediaService,
  SocialService,
} from '../types';
import { logger } from '../helpers';

export class Mastodon implements SocialMediaService {
  private readonly instance: string;
  private readonly accessToken: string;
  private readonly postVisibility: MastodonPostVisibilitySetting;

  constructor(params: MastodonSettings) {
    this.accessToken = params.accessToken;
    this.instance = params.instance;
    this.postVisibility = params.postVisibility;
  }

  private validateConfig() {
    return this.accessToken.length > 0 && this.instance.length > 0;
  }

  private async getClient() {
    return await login({
      url: this.instance,
      accessToken: this.accessToken,
    });
  }

  async post(content: string): Promise<PostedStatusUrl | PostSubmitStatus> {
    if (!config.SOCIAL_MEDIA.SERVICES_TO_UPDATE.mastodon) {
      logger.warning('Posting to Mastodon is disabled. Skipping...');
      return PostSubmitStatus.disabled;
    }

    if (!content) {
      logger.warning('Post content is empty. Skipping...');
      return PostSubmitStatus.skipped;
    }

    if (!this.validateConfig()) {
      logger.warning(`Mastodon configuration incomplete. Skipping...`);
      return PostSubmitStatus.notConfigured;
    }

    logger.info('Posting to Mastodon...');

    try {
      const client = await this.getClient();

      const postedStatus = await client.v1.statuses.create({
        status: content,
        visibility: this.postVisibility,
      });

      return postedStatus.url as PostedStatusUrl;
    } catch (error) {
      if (error instanceof Error) logger.notice(error.message);
      return PostSubmitStatus.errored;
    }
  }
}

export const postToMastodon = async (content: string) => {
  const settings = config.SOCIAL_MEDIA[SocialService.mastodon];
  return new Mastodon(settings).post(content);
};
