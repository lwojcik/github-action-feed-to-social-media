import { FeedItem } from '../types';
import { extractTags } from './extractTags';

export const formatPostContent = (content: FeedItem, postFormat: string) => {
  const itemTags = extractTags(postFormat);

  return itemTags.reduce((acc, itemTag) => {
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
