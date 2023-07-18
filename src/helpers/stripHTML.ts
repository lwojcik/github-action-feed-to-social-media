export const stripHTML = (content: string) =>
  content.replace(/(<([^>]+)>)/gi, '');
