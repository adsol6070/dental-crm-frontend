export function resolveRoute<T extends string | ((...args: any[]) => string)>(
  route: T,
  ...args: T extends (...args: infer P) => any ? P : []
): string {
  return typeof route === "function" ? route(...args) : route;
}
