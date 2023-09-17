import { BskyBot } from 'easy-bsky-bot-sdk';
import { config } from '../config';
import {
  BlueskySettings,
  PostSubmitStatus,
  SocialMediaService,
  SocialService,
} from '../types';
import { logger } from '../logger';

export class Bluesky implements SocialMediaService {
  private readonly service: string;
  private readonly handle: string;
  private readonly appPassword: string;
  private readonly ownerHandle: string;
  private readonly ownerContact: string;

  constructor(params: BlueskySettings) {
    this.service = params.service || 'https://bsky.social';
    this.handle = params.handle;
    this.appPassword = params.appPassword;
    this.ownerHandle = params.ownerHandle;
    this.ownerContact = params.ownerContact;
  }

  private validateConfig() {
    return (
      this.handle.length > 0 &&
      this.handle.includes('.') &&
      this.appPassword.length > 0 &&
      this.ownerHandle.length > 0 &&
      this.ownerContact.length > 0
    );
  }

  private async getClient() {
    BskyBot.setOwner({
      handle: this.ownerHandle,
      contact: this.ownerContact,
    });

    const bot = new BskyBot({
      service: this.service,
      handle: this.handle,
      useNonBotHandle: true,
    });

    await bot.login(this.appPassword);

    return bot;
  }

  async post(content: string) {
    if (!config.SOCIAL_MEDIA.SERVICES_TO_UPDATE.bluesky) {
      logger.warning('Posting to Bluesky is disabled. Skipping...');
      return PostSubmitStatus.disabled;
    }

    if (!this.validateConfig()) {
      logger.warning(`Bluesky configuration incomplete. Skipping...`);
      return PostSubmitStatus.notConfigured;
    }

    logger.info('Posting to Bluesky...');

    try {
      const client = await this.getClient();

      await client.post({
        text: content,
      });

      await client.kill();

      return PostSubmitStatus.updated;
    } catch (error) {
      if (error instanceof Error) logger.warning(error.message);
      return PostSubmitStatus.errored;
    }
  }
}

export const postToBluesky = async (content: string) => {
  const settings = config.SOCIAL_MEDIA[SocialService.bluesky];
  return new Bluesky(settings).post(content);
};
