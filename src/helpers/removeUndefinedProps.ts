type GenericObject = {
  [key: string]: any;
};

export const removeUndefinedProps = <T = GenericObject>(obj: T) => {
  const result = {} as T;

  for (let prop in obj) {
    if (obj[prop] !== undefined) {
      result[prop] = obj[prop];
    }
  }

  return result;
};
