import { extractTags } from '../../src/helpers/extractTags';

describe('extractTags', () => {
  it('should extract tags that contain valid characters', () => {
    const postFormat =
      'This is a {validTag1} and {validTag2:example} with {validTag3.0} tags.';
    const expectedTags = ['validTag1', 'validTag2:example', 'validTag3.0'];

    const extractedTags = extractTags(postFormat);

    expect(extractedTags).toEqual(expectedTags);
  });

  it('should return an empty array when no valid tags are found', () => {
    const postFormat = 'This is a test without any valid tags.';

    const extractedTags = extractTags(postFormat);

    expect(extractedTags).toEqual([]);
  });

  it('should ignore tags with invalid characters', () => {
    const postFormat =
      'This is a {validTag} and {invalidTag@$%} with {anotherValidTag} tags.';
    const expectedTags = ['validTag', 'anotherValidTag'];

    const extractedTags = extractTags(postFormat);

    expect(extractedTags).toEqual(expectedTags);
  });
});
