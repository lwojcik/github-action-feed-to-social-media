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

export enum ExtraEntryField {
  category = 'category',
  pubDate = 'pubDate',
  enclosure = 'enclosure',
  itunesSubtitle = 'itunes:subtitle',
  itunesImage = 'itunes:image',
  itunesExplicit = 'itunes:explicit',
  itunesKeywords = 'itunes:keywords',
  itunesEpisodeType = 'itunes:episodeType',
  itunesDuration = 'itunes:duration',
  itunesEpisode = 'itunes:episode',
}

export enum ExtraEntryProperty {
  text = '@_text',
  href = '@_href',
  url = '@_url',
  type = '@_type',
  length = '@_length',
}

export type Enclosure = {
  url?: string;
  length?: string;
  type?: string;
};

export type FeedItem = Omit<FeedEntry, 'published'> & {
  [key: string]: unknown;
  published: TimestampInMiliseconds;
  [ExtraEntryField.category]?: string;
  [ExtraEntryField.pubDate]?: string;
  [ExtraEntryField.enclosure]?: Enclosure;
  [ExtraEntryField.itunesSubtitle]?: string;
  [ExtraEntryField.itunesImage]?: string;
  [ExtraEntryField.itunesExplicit]?: string;
  [ExtraEntryField.itunesKeywords]?: string;
  [ExtraEntryField.itunesEpisodeType]?: string;
  [ExtraEntryField.itunesDuration]?: string;
  [ExtraEntryField.itunesEpisode]?: number;
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
