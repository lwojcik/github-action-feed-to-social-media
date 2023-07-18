import { FeedItem } from '../types';
import { extractTags } from './extractTags';

export const formatPostContent = (content: FeedItem, postFormat: string) => {
  const itemTags = extractTags(postFormat);

  return itemTags.reduce((acc, itemTag) => {
    if (!content?.[itemTag]) {
      throw new Error(
        `Cannot find value for {${itemTag}} property in the feed. Please check your postFormat setting. If the property exists in your feed and you still see this error, consider opening a GitHub issue: https://github.com/lwojcik/github-action-feed-to-social-media/issues/new`
      );
    }

    const nestedTag = itemTag.split('.');

    if (nestedTag.length === 2) {
      return acc.replace(
        `{${itemTag}}`,
        (content[nestedTag[0]] as Record<string, any>)[nestedTag[1]] as string
      );
    }

    return acc.replace(`{${itemTag}}`, content[itemTag] as string);
  }, postFormat);
};
