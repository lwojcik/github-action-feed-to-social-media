export const convertArrayToObject = (
  arr: { [key: string]: string }[]
): { [key: string]: string } => {
  const result: { [key: string]: string } = {};

  for (const item of arr) {
    const key = Object.keys(item)[0];
    const value = Object.values(item)[0];
    result[key] = value;
  }

  return result;
};
