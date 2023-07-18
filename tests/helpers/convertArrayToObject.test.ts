import { convertArrayToObject } from '../../src/helpers/convertArrayToObject';

describe('convertArrayToObject', () => {
  it('should convert the array to an object', () => {
    const array = [
      { mastodon: 'skipped' },
      { mastodonMetadata: 'skipped' },
      { twitter: 'skipped' },
      { discord: 'skipped' },
      { slack: 'skipped' },
    ] as {
      [key: string]: string;
    }[];

    const result = convertArrayToObject(array);

    expect(result).toEqual({
      mastodon: 'skipped',
      mastodonMetadata: 'skipped',
      twitter: 'skipped',
      discord: 'skipped',
      slack: 'skipped',
    });
  });

  it('should return an empty object when given an empty array', () => {
    const array: { [key: string]: string }[] = [];
    const result = convertArrayToObject(array);

    expect(result).toEqual({});
  });

  it('should handle duplicate keys by overwriting the previous value', () => {
    const array = [{ key: 'value1' }, { key: 'value2' }, { key: 'value3' }];

    const result = convertArrayToObject(array);

    expect(result).toEqual({ key: 'value3' });
  });
});
