import { FeedEntry } from '@extractus/feed-extractor';

export enum ActionInput {
  // General
  feedUrl = 'feedUrl',
  newestItemStrategy = 'newestItemStrategy',
  cacheDirectory = 'cacheDirectory',
  cacheFileName = 'cacheFileName',
  postFormat = 'postFormat',
  titlePrefix = 'titlePrefix',
  linkPrefix = 'linkPrefix',
  postSeparator = 'postSeparator',
  postFooter = 'postFooter',
  // Mastodon
  mastodonType = 'mastodonType',
  mastodonEnable = 'mastodonEnable',
  mastodonInstance = 'mastodonInstance',
  mastodonAccessToken = 'mastodonAccessToken',
  mastodonPostVisibility = 'mastodonPostVisibility',
  // Mastodon metadata
  mastodonMetadataEnable = 'mastodonMetadataEnable',
  mastodonMetadataInstance = 'mastodonMetadataInstance',
  mastodonMetadataAccessToken = 'mastodonMetadataAccessToken',
  mastodonMetadataFieldIndex = 'mastodonMetadataFieldIndex',
  // Twitter
  twitterEnable = 'twitterEnable',
  twitterApiKey = 'twitterApiKey',
  twitterApiKeySecret = 'twitterApiKeySecret',
  twitterAccessToken = 'twitterAccessToken',
  twitterAccessTokenSecret = 'twitterAccessTokenSecret',
  // Discord
  discordEnable = 'discordEnable',
  discordWebhookUrl = 'discordWebhookUrl',
  // Slack
  slackEnable = 'slackEnable',
  slackWebhookUrl = 'slackWebhookUrl',
}

export enum ActionOutput {
  updateStatus = 'updateStatus',
}

export enum SocialService {
  mastodon = 'mastodon',
  mastodonMetadata = 'mastodonMetadata',
  twitter = 'twitter',
  discord = 'discord',
  slack = 'slack',
}

export enum NewestItemStrategy {
  latestDate = 'latestDate',
  first = 'first',
  last = 'last',
}

export type TimestampInMiliseconds = number;

export type FeedItem = Omit<FeedEntry, 'published'> & {
  [key: string]: string | number | boolean | Record<string, any>;
  enclosure: {
    url: string;
    length: string;
    type: string;
  };
  published: TimestampInMiliseconds;
};

export type PostedStatusUrl = string;

export enum PostSubmitStatus {
  disabled = 'disabled',
  notConfigured = 'notConfigured',
  updated = 'updated',
  errored = 'errored',
  skipped = 'skipped',
}

export abstract class SocialMediaService {
  abstract post(content: string): Promise<PostedStatusUrl | PostSubmitStatus>;
}

export enum MastodonPostVisibilitySetting {
  public = 'public',
  unlisted = 'unlisted',
  private = 'private',
  direct = 'direct',
}

export interface MastodonSettings {
  accessToken: string;
  instance: string;
  postVisibility: MastodonPostVisibilitySetting;
}

export type MastodonMetadataSettings = Omit<
  MastodonSettings,
  'postVisibility'
> & {
  fieldIndex: number;
};

export interface TwitterSettings {
  apiKey: string;
  apiKeySecret: string;
  accessToken: string;
  accessTokenSecret: string;
}

export interface DiscordSettings {
  webhookUrl: string;
}

export interface SlackSettings {
  webhookUrl: string;
}
