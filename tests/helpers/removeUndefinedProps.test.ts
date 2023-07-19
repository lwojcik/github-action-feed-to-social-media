import { removeUndefinedProps } from '../../src/helpers/removeUndefinedProps';

describe('removeUndefinedProps', () => {
  it('should remove properties with undefined values', () => {
    const obj = {
      id: 'https://example.org',
      title: 'Sample title',
      link: 'https://example.org',
      published: 1680651000000,
      description: 'Sample description',
      enclosure: undefined,
      category: undefined,
      'itunes:image': undefined,
    };

    const expectedObj = {
      id: 'https://example.org',
      title: 'Sample title',
      link: 'https://example.org',
      published: 1680651000000,
      description: 'Sample description',
    };

    const result = removeUndefinedProps(obj);

    expect(result).toEqual(expectedObj);
    expect(result).not.toBe(obj);
  });
});
