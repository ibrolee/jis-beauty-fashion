/** React/Next.js embeds private form-action bookkeeping fields inside submitted FormData.
 * Older site settings accidentally persisted some of these as JSON properties.
 * Remove only reserved form-action keys, never legitimate owner-entered content.
 */
export function isReactActionField(key: string): boolean {
  return /^\$ACTION(?:_|$)/.test(key);
}

export function stripReactActionFields<T>(value: T): T {
  if (Array.isArray(value)) return value.map((item) => stripReactActionFields(item)) as T;
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([key]) => !isReactActionField(key))
        .map(([key, child]) => [key, stripReactActionFields(child)]),
    ) as T;
  }
  return value;
}
