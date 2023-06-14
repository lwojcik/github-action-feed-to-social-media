# GitHub Action: Feed to Social Media

[![Build status](https://ci.appveyor.com/api/projects/status/d8i9g7c4ya7sr03p/branch/main?svg=true)](https://ci.appveyor.com/project/lwojcik/github-action-feed-to-social-media/branch/main) [![codecov](https://codecov.io/github/lwojcik/github-action-feed-to-social-media/branch/main/graph/badge.svg?token=VkGBrPHbWA)](https://codecov.io/github/lwojcik/github-action-feed-to-social-media)

This GitHub Action selects latest item from RSS / Atom feed and posts it to one or more social media sites.

Supported platforms:

- Mastodon (posting to account + updating profile metadata)
- Twitter
- Slack
- Discord

This GitHub Action is heavily inspired by [Any Feed to Mastodon GitHub Action](https://github.com/nhoizey/github-action-feed-to-mastodon) by [Nicolas Hoizey](https://github.com/nhoizey/github-action-feed-to-mastodon). However, there are significant scope and use case diffences between the two:

- this Action employs naively straightforward algorithm for determining whether new items should be posted or not. You can choose between 3 different strategies (top of the item array, bottom of the item array, latest publication date).

- only one feed item is posted each time. This Action isn't suitable for fast-moving feeds that burst multiple new items on each check and that's intentional.

- published posts can use custom formatting. Example: `'New article: {article} {link} #someHashtag`

## Usage

Below is a action workflow that uses all available options:

```yaml
name: Feed to social Media
on:
  workflow_dispatch:

jobs:
  Feed2SocialMedia:
    runs-on: ubuntu-latest
    steps:
      # Checkout the repository to restore previous cache
      - name: Checkout
        uses: actions/checkout@v3

      # Post to social media
      - name: Feed to social media
        uses: lwojcik/github-action-feed-to-social-media@v1
        with:
          feedUrl: 'https://offbeatbits.com/excerpts.xml'
          newestItemStrategy: 'latestDate'
          postFormat: "New post: {title}\n\n{link}"
          # Mastodon settings
          mastodonEnable: true
          mastodonInstance: 'https://mas.to'
          mastodonAccessToken: 'MASTODON_ACCESS_TOKEN'
          mastodonPostVisibility: 'unlisted'
          # Mastodon metadata settings
          mastodonMetadataEnable: true
          mastodonMetadataInstance: 'https://mas.to'
          mastodonMetadataAccessToken: 'MASTODON_METADATA_ACCESS_TOKEN'
          mastodonMetadataFieldIndex: 0
          # Twitter settings
          twitterEnable: true
          twitterApiKey: 'TWITTER_API_KEY'
          twitterApiKeySecret: 'TWITTER_API_SECRET'
          twitterAccessToken: 'TWITTER_ACCESS_TOKEN'
          twitterAccessTokenSecret: 'TWITTER_ACCESS_TOKEN_SECRET'
          # Discord settings
          discordEnable: true
          discordWebhookUrl: 'DISCORD_WEBHOOK_URL'
          # Slack settings
          slackEnable: true
          slackWebhookUrl: 'DISCORD_WEBHOOK_URL'

      # Make sure files are up to date if other commits have been pushed in the mean time
      - name: Pull any changes from Git
        run: git pull

      # Push cache changes to the repository
      - name: Commit and push
        uses: stefanzweifel/git-auto-commit-action@v4
```

Note that we use `actions/checkout@v3` and `stefanzweifel/git-auto-commit-action@v4` to restore and update feed cache. That way the Action won't post the same thing twice.

The action won't post anything if cache is empty (i.e. on first run or when you delete cache from the directory).

To store sensitive information (e.g. access tokens) use [Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets) so that you can keep your action workflow public in a safe way:

```yaml
 - name: Feed to social media
    uses: lwojcik/github-action-feed-to-social-media@v1
    with:
      feedUrl: 'https://example.org/your-feed-url.xml'
      # Mastodon settings
      mastodonEnable: true
      mastodonInstance: 'https://your-mastodon-instance-url.example.org'
      mastodonAccessToken: ${{ secrets.MASTODON_ACCESS_TOKEN }}
```

## Settings (aka GitHub Action Inputs)

### Required minimum settings

- `feedUrl` (required) - URL of RSS / ATOM feed. Example: `https://offbeatbits.com/excerpts.xml`
- `newestItemStrategy` - the way newest item is determined. Defaults to `latestDate`. The following strategies are available:
  - `latestDate` - item with the latest publication date regardless of its position in the entry array
  - `first` - first item in the feed in order of appearance
  - `last` - last item in the feed in order of appearance
- `postFormat` - format string for new posts. Example: `New article: {article} \n\n {link} \n\n #someHashtag`. Default setting: `{title} {link}`

### Mastodon settings

Posting to Mastodon is done by [masto](https://www.npmjs.com/package/masto) library.

To use this feature, create a new application in `Development` section of your profile settings and note down your access token.

- `mastodonEnable` - enables / disables posting to Mastodon. Default: `false`
- `mastodonInstance` - instance URL. Example: `https://mastodon.social`
- `mastodonAccessToken` - access token for your Mastodon API app
- `mastodonPostVisibility` - visibility setting for your posts. Defaults to `public`. Available options:
  - `public` - visible for all
  - `unlisted` - visible for all but opted-out of discovery features like local / federated feeds
  - `private` - followers only
  - `direct` - visible only to the posting account and mentioned people

### Mastodon metadata settings

Updating Mastodon profile metadata is done by [masto](https://www.npmjs.com/package/masto) library.

Setting this up enables you to update your account's profile metadata with a link to your latest RSS item.

**Note:** if you set `mastodonMetadataEnable` to `true` and leave other settings in this section empty, the Action will update profile metadata on the same account as the one used for posting - **you don't have to provide the same data twice**.

Provide an instance and access token in this section only if you want to update profile metadata on a different profile than the one you post to.

The Action will only update the value of an _existing_ metadata entry and it will _not_ create a new one if it fails to find it. Before running the Action for the first time, make sure the metadata field you want to update already exists.

- `mastodonMetadataEnable` - enables / disables updating Mastodon accouns metadata. Default: `false`
- `mastodonMetadataInstance` - Mastodon instance. Example: `https://mastodon.social`
- `mastodonMetadataAccessToken` - access token for your Mastodon API app
- `mastodonMetadataFieldIndex` - which metadata field should be updated? `0` is the first item

_Shoutout to [Sammy](https://github.com/theresnotime) and their [Mastodon Field Changer](https://github.com/theresnotime/mastodon-field-changer) for inspiring me to research this feature. Thanks!_

### Twitter settings

Posting to Twitter is done by [twitter-api-v2](https://www.npmjs.com/package/twitter-api-v2) library. Authentication is done via Oauth 1.0a protocol.

To post an update to a Twitter account you need to set up an app through [Twitter Developer Portal](https://developer.twitter.com/) and obtain the following set of credentials:

- API key
- API secret
- access token
- access token secret

The Action was tested and confirmed to work against free tier of Twitter API v2 in June 2023.

- `twitterEnable` - enables / disables posting to Twitter. Default: `false`
- `twitterApiKey` - Twitter API key
- `twitterApiKeySecret` - Twitter API key secret
- `twiiterAccessToken` - Twitter access token for your app
- `twitterAccessTokenSecret` - Twitter access token secret for your app

### Discord settings

Posting to Discord is done by a custom wrapper around [Discord webhook mechanism](https://discord.com/developers/docs/resources/webhook).

To obtain a webhook URL follow the steps below:

1. Click on **Server settings** on the server you want to add a webhook for
2. Select `Integrations`.
3. Click **Create webhook**.
4. Adjust available webhook settings. When done, click **Copy Webhook URL** - that's the URL you have to provide for the Action to post on your channel.

- `discordEnable` - enables / disables posting to Discord. Default: `false`
- `discordWebhookUrl` - webhook URL to use for posting. Example: `https://discordapp.com/api/webhooks/123456`

### Slack settings

Posting to Slack is done by a custom wrapper around [Slack Incoming Webhooks mechanism](https://api.slack.com/messaging/webhooks).

To obtain a webhook URL follow the steps below:

1. Log in to the workspace of your choice, then open [Apps page](https://api.slack.com/apps).
2. Click **Create an App** and select **From scratch**.
3. Fill in the app name and select correct workspace to integrate with.
4. Click **Create an app**.
5. On the page you see, click **Incoming Webhooks**. Click the toggle next to **Activate Incoming Webhooks** to enable it.
6. Click **Add New Webhook to Workspace**.
7. In the permission window, select a channel for the Action to post to and click **Allow**.
8. You'll be redirected back to the Incoming Webhooks page. Copy the webhook URL from the table - that's the URL you provide to the Action.

- `slackEnable` - enables / disables posting to Slack. Default: `false`
- `slackWebhookUrl` - webhook URL to use for posting. Example: `https://hooks.slack.com/services/123/456`

## Output

The Action sets the output in a following format of a stringified JSON object:

```js
{
  [SocialService]: PostSubmitStatus,
}
```

`SocialService` is the name of a social media service that has been updated. The following values are possible:

- `mastodon`
- `mastodonMetadata`
- `twitter`
- `discord`
- `slack`

See also [SocialService enum](https://github.com/lwojcik/github-action-feed-to-social-media/blob/main/src/types.ts#L39).

`PostSubmitStatus` is the status of the last update. The following values are possible:

- **URL string** - new item was detected and the update was posted successfuly - the URL points to a published status (for services that expose status URLs, like Twitter and Mastodon)
- `disabled` - posting to the selected service is disabled by workflow configuration
- `notConfigured` - posting to the selected service is enabled, but configuration is incomplete (e.g. missing access key)
- `updated` - new item was detected and the update was posted successfully (for services that don't expose post URLs, e.g. Mastodon metadata or Discord webooks),
- `errored` - new item was detected and the update was posted, but it resulted in an error,
- `skipped` - no new item was detected or “posting” was skipped for a different reason - see the log for information.

See also [PostSubmitStatus enum](https://github.com/lwojcik/github-action-feed-to-social-media/blob/main/src/types.ts#L61).

Sample status:

```json
{
  "mastodon": "https://mastodon.social/url-to-status",
  "mastodonMetadata": "updated",
  "twitter": "https://twitter.com/twitter/status/123456",
  "discord": "updated",
  "slack": "updated"
}
```

## Infrequently Asked Questions

1. **Can this Action support posting to [insert platform name here]?**

General answer to this question is: **yes, as long as the platform offers publicly available API for posting text messages**. The architecture of the Action makes it possible to extend it with new services in a consistent way.

**But.**

If the platform is **Pixelfed, Instagram, TikTok** or any other platform focused on visuals rather than text - I'm not sure how to post text content to them.

If the platform is **any ActivityPub-based platform other than Mastodon** - see the first paragraph and consider [submitting an issue](https://github.com/lwojcik/github-action-feed-to-social-media/issues) if you want to see it added.

If the platform is **Kbin** - I'm not aware of posting API being available (I only know of read-only APIs which are irrelevant for this Action). I like Kbin and do use Kbin myself. I don't exclude revisiting this in the future.

If the platform is **Lemmy** - so far I didn't have personal interest in supporting it but [that seems to be doable](https://join-lemmy.org/docs/en/contributors/04-api.html). Consider [submitting an issue](https://github.com/lwojcik/github-action-feed-to-social-media/issues) if you want to see it added.

If the platform is **LinkedIn** - I explored LinkedIn API and at some point I had a nearly complete implementation of automated posting to a company page. However, some crucial features of their API (such as generating OAuth access tokens) are locked behind manually approved request forms or vague "Contact your local salesperson" statements. I cannot offer a feature if I can't give it full testing. Getting through approval stage consumes time and thus it's a bit out of my personal interest scope. If you're interested in seeing this feature, [consider sponsoring its development](https://github.com/sponsors/lwojcik).

If the the platform wasn't mentioned above - I either didn't consider it (I didn't know of its existence?) or it doesn't offer API to send posts. Want to see it? Consider [opening an issue](https://github.com/lwojcik/github-action-feed-to-social-media/issues).

## License

Licensed under MIT License. See [LICENSE](./LICENSE) for more information.
