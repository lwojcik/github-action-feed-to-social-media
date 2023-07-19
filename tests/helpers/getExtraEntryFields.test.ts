import { getExtraEntryFields } from '../../src/helpers/getExtraEntryFields';

describe('getExtraEntryFields', () => {
  test('returns expected extra fields when feedEntry has all required properties', () => {
    const feedEntry = {
      enclosure: {
        '@_url': 'https://example.com/audio.mp3',
        '@_type': 'audio/mpeg',
        '@_length': 1024,
      },
      category: {
        '@_text': 'Technology',
      },
      pubDate: '2023-07-19',
      'itunes:subtitle': 'Episode subtitle',
      'itunes:image': 'https://example.com/image.jpg',
      'itunes:explicit': false,
      'itunes:keywords': 'keyword1,keyword2',
      'itunes:episodeType': 'full',
      'itunes:duration': '00:30:00',
      'itunes:episode': 1,
    };

    const result = getExtraEntryFields(feedEntry);
    expect(result).toMatchSnapshot();
  });

  test('returns expected extra fields when feedEntry has missing properties', () => {
    const feedEntry = {
      enclosure: {
        url: 'https://example.com/audio.mp3',
      },
      category: {},
    };

    const result = getExtraEntryFields(feedEntry);
    expect(result).toMatchSnapshot();
  });

  test('returns expected extra fields when feedEntry has undefined properties', () => {
    const feedEntry = {
      enclosure: undefined,
      category: undefined,
    };

    const result = getExtraEntryFields(feedEntry);
    expect(result).toMatchSnapshot();
  });

  test('returns expected extra fields when feedEntry has incomplete properties', () => {
    const feedEntry = {};

    const result = getExtraEntryFields(feedEntry);
    expect(result).toMatchSnapshot();
  });
});
