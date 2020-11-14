export function isString(item: any): item is string {
  return typeof item === "string";
}

export const unique = <T>(x: T[]): T[] =>
  x.filter((y, i, self) => self.indexOf(y) === i);

export const limitList = <T>(limit: number | undefined) => (
  _val: T,
  index: number
) => (limit ? index + 1 <= limit : true);
