/** N'accepte qu'un chemin interne (« /… »), jamais une adresse externe : évite les redirections ouvertes. */
export function safeInternalPath(value: string | string[] | undefined, fallback = '/'): string {
  const v = Array.isArray(value) ? value[0] : value
  return v && v.startsWith('/') && !v.startsWith('//') && !v.startsWith('/\\') ? v : fallback
}

export function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}
