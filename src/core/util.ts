/** Entfernt das `id`-Feld, damit Dexie eine neue ID vergibt. */
export function withoutId<T extends { id?: unknown }>(obj: T): Omit<T, 'id'> {
  const { id: _id, ...rest } = obj;
  void _id;
  return rest;
}
