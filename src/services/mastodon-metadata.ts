import { login } from 'masto';
import { config } from '../config';
import {
  MastodonMetadataSettings,
  PostSubmitStatus,
  SocialService,
} from '../types';
import { logger } from '../logger';
import { stripHTML } from '../helpers';

export class MastodonMetadata {
  private readonly instance: string;
  private readonly accessToken: string;
  private readonly fieldIndex: number;

  constructor(params: MastodonMetadataSettings) {
    this.accessToken = params.accessToken;
    this.instance = params.instance;
    this.fieldIndex = params.fieldIndex;
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

  private updateMetadataFields({
    accountMetadataFields,
    content,
  }: {
    accountMetadataFields: {
      name: string;
      value: string;
    }[];
    content: string;
  }) {
    const updatedMetadataFields = accountMetadataFields.map(
      ({ name, value }) => ({
        name,
        value: stripHTML(value),
      })
    );

    updatedMetadataFields[this.fieldIndex] = {
      name: accountMetadataFields[this.fieldIndex].name,
      value: content,
    };

    return updatedMetadataFields;
  }

  async update(content: string) {
    if (!content) {
      logger.warning('Post content is empty. Skipping...');
      return PostSubmitStatus.skipped;
    }

    if (!config.SOCIAL_MEDIA.SERVICES_TO_UPDATE.mastodonMetadata) {
      logger.warning('Updating Mastodon metadata is disabled. Skipping...');
      return PostSubmitStatus.disabled;
    }

    if (!this.validateConfig()) {
      logger.warning(
        `Updating Mastodon metadata configuration incomplete. Skipping...`
      );
      return PostSubmitStatus.notConfigured;
    }

    try {
      logger.info('Updating Mastodon metadata...');

      const client = await this.getClient();
      const accountCredentials = await client.v1.accounts.verifyCredentials();

      const accountMetadataFields = accountCredentials.fields;

      if (!accountMetadataFields || accountMetadataFields.length === 0) {
        logger.warning('Profile metadata is empty. Skipping...');
        return PostSubmitStatus.skipped;
      }

      if (accountMetadataFields[this.fieldIndex] === undefined) {
        logger.warning(
          `Profile metadata field on index ${this.fieldIndex} does not exist. Skipping...`
        );
        return PostSubmitStatus.skipped;
      }

      const updatedMetadataFields = this.updateMetadataFields({
        accountMetadataFields,
        content,
      });

      await client.v1.accounts.updateCredentials({
        fieldsAttributes: updatedMetadataFields,
      });

      return PostSubmitStatus.updated;
    } catch (error) {
      if (error instanceof Error) logger.notice(error.message);
      return PostSubmitStatus.errored;
    }
  }
}

export const updateMastodonMetadata = async (content: string) => {
  const settings = config.SOCIAL_MEDIA[SocialService.mastodonMetadata];
  return new MastodonMetadata(settings).update(content);
};
