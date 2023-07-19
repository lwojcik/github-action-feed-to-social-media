import { stripHTML } from '../../src/helpers/stripHTML';

describe('stripHTML', () => {
  it('removes HTML tags from the content', () => {
    const content = '<p>Hello, <b>World!</b></p>';
    const result = stripHTML(content);
    expect(result).toBe('Hello, World!');
  });

  it('returns the original content if there are no HTML tags', () => {
    const content = 'Hello, World!';
    const result = stripHTML(content);
    expect(result).toBe(content);
  });
});
