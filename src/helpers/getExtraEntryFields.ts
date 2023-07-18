import {
  Enclosure,
  ExtraEntryField,
  ExtraEntryProperty,
  FeedItem,
} from '../types';
import { removeUndefinedProps } from './removeUndefinedProps';

export const getExtraEntryFields = (feedEntry: Record<string, any>) => {
  const extraFields: Partial<FeedItem> = {
    [ExtraEntryField.enclosure]: feedEntry?.[ExtraEntryField.enclosure]
      ? removeUndefinedProps<Enclosure>({
          url: feedEntry?.[ExtraEntryField.enclosure]?.[ExtraEntryProperty.url],
          type: feedEntry?.[ExtraEntryField.enclosure]?.[
            ExtraEntryProperty.type
          ],
          length:
            feedEntry?.[ExtraEntryField.enclosure]?.[ExtraEntryProperty.length],
        })
      : undefined,
    [ExtraEntryField.category]: feedEntry?.[ExtraEntryField.category]?.[
      ExtraEntryProperty.text
    ]
      ? feedEntry?.[ExtraEntryField.category]?.[ExtraEntryProperty.text]
      : feedEntry?.[ExtraEntryField.category],
    [ExtraEntryField.pubDate]:
      feedEntry?.[ExtraEntryField.pubDate] || undefined,
    [ExtraEntryField.itunesSubtitle]:
      feedEntry?.[ExtraEntryField.itunesSubtitle],
    [ExtraEntryField.itunesImage]:
      feedEntry?.[ExtraEntryField.itunesImage]?.[ExtraEntryProperty.href],
    [ExtraEntryField.itunesExplicit]:
      feedEntry?.[ExtraEntryField.itunesExplicit],
    [ExtraEntryField.itunesKeywords]:
      feedEntry?.[ExtraEntryField.itunesKeywords],
    [ExtraEntryField.itunesEpisodeType]:
      feedEntry?.[ExtraEntryField.itunesEpisodeType],
    [ExtraEntryField.itunesDuration]:
      feedEntry?.[ExtraEntryField.itunesDuration],
    [ExtraEntryField.itunesEpisode]: feedEntry?.[ExtraEntryField.itunesEpisode],
  };

  return removeUndefinedProps(extraFields);
};
