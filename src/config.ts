import { getInput, getBooleanInput } from '@actions/core';
import {
  ActionInput,
  MastodonPostVisibilitySetting,
  NewestItemStrategy,
  SocialService,
} from './types';

const cacheDirectory = getInput(ActionInput.cacheDirectory);
const cacheFileName = getInput(ActionInput.cacheFileName);

const feedSettings = {
  FEED_URL: getInput(ActionInput.feedUrl, { required: true }),
  LATEST_ITEM_STRATEGY: getInput(
    ActionInput.newestItemStrategy
  ) as NewestItemStrategy,
};

const cacheSettings = {
  CACHE_DIRECTORY: cacheDirectory,
  CACHE_FILE_NAME: cacheFileName,
};

const postSettings = {
  POST_FORMAT: getInput(ActionInput.postFormat, {
    trimWhitespace: false,
  }),
};

const servicesToUpdate = {
  [SocialService.mastodon]: getBooleanInput(ActionInput.mastodonEnable),
  [SocialService.mastodonMetadata]: getBooleanInput(
    ActionInput.mastodonMetadataEnable
  ),
  [SocialService.twitter]: getBooleanInput(ActionInput.twitterEnable),
  [SocialService.discord]: getBooleanInput(ActionInput.discordEnable),
  [SocialService.slack]: getBooleanInput(ActionInput.slackEnable),
  [SocialService.bluesky]: getBooleanInput(ActionInput.blueskyEnable),
};

const mastodonSettings = {
  postFormat: getInput(ActionInput.mastodonPostFormat, {
    trimWhitespace: false,
  }),
  instance: getInput(ActionInput.mastodonInstance),
  accessToken: getInput(ActionInput.mastodonAccessToken),
  postVisibility: getInput(
    ActionInput.mastodonPostVisibility
  ) as MastodonPostVisibilitySetting,
};

const mastodonMetadataSettings = {
  instance:
    getInput(ActionInput.mastodonMetadataInstance) ||
    getInput(ActionInput.mastodonInstance),
  accessToken:
    getInput(ActionInput.mastodonMetadataAccessToken) ||
    getInput(ActionInput.mastodonAccessToken),
  fieldIndex: parseInt(getInput(ActionInput.mastodonMetadataFieldIndex)),
};

const twitterSettings = {
  postFormat: getInput(ActionInput.twitterPostFormat, {
    trimWhitespace: false,
  }),
  apiKey: getInput(ActionInput.twitterApiKey),
  apiKeySecret: getInput(ActionInput.twitterApiKeySecret),
  accessToken: getInput(ActionInput.twitterAccessToken),
  accessTokenSecret: getInput(ActionInput.twitterAccessTokenSecret),
};

const discordSettings = {
  postFormat: getInput(ActionInput.discordPostFormat, {
    trimWhitespace: false,
  }),
  webhookUrl: getInput(ActionInput.discordWebhookUrl),
};

const slackSettings = {
  postFormat: getInput(ActionInput.slackPostFormat, {
    trimWhitespace: false,
  }),
  webhookUrl: getInput(ActionInput.slackWebhookUrl),
};

const blueskySettings = {
  postFormat: getInput(ActionInput.blueskyPostFormat, {
    trimWhitespace: false,
  }),
  service: getInput(ActionInput.blueskyService),
  handle: getInput(ActionInput.blueskyHandle),
  appPassword: getInput(ActionInput.blueskyAppPassword),
  ownerHandle: getInput(ActionInput.blueskyOwnerHandle),
  ownerContact: getInput(ActionInput.blueskyOwnerContact),
};

export const config = {
  ...feedSettings,
  ...cacheSettings,
  ...postSettings,
  SOCIAL_MEDIA: {
    SERVICES_TO_UPDATE: servicesToUpdate,
    [SocialService.mastodon]: mastodonSettings,
    [SocialService.mastodonMetadata]: mastodonMetadataSettings,
    [SocialService.twitter]: twitterSettings,
    [SocialService.discord]: discordSettings,
    [SocialService.slack]: slackSettings,
    [SocialService.bluesky]: blueskySettings,
  },
};
