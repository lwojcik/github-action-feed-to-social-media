import { formatPostContent } from '../../src/helpers/formatPostContent';
import { FeedItem } from '../../src/types';

describe('formatPostContent', () => {
  const content = {
    title: 'Sample Title',
    enclosure: {
      url: 'https://example.org',
    },
    'itunes:image': 'https://example.org/image.jpg',
  } as unknown as FeedItem;

  test('should format post content correctly', () => {
    const postFormat =
      'Title: {title} / Image: {itunes:image} / URL: {enclosure.url}';
    const expected =
      'Title: Sample Title / Image: https://example.org/image.jpg / URL: https://example.org';
    const formattedContent = formatPostContent(content, postFormat);
    expect(formattedContent).toEqual(expected);
  });
});
