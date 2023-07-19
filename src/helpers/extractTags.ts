export const extractTags = (postFormat: string) => {
  const regex = /{([A-Za-z0-9:.]+)}/g;
  const matches = postFormat.match(regex);
  if (matches) {
    return matches.map((match) => match.slice(1, -1));
  } else {
    return [];
  }
};
