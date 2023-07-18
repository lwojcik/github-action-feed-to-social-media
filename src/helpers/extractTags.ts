export const extractTags = (postFormat: string) => {
  const regex = /{([^}]+)}/g;
  const matches = postFormat.match(regex);
  if (matches) {
    return matches.map((match) => match.slice(1, -1));
  } else {
    return [];
  }
};
