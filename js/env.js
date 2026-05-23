/**
 * Reads .env at runtime and injects into window.__ENV.
 * Fetches the .env file from the server root.
 * Only works when served via HTTP (not file://).
 */
export async function loadEnv() {
  try {
    const res = await fetch('/.env')
    if (!res.ok) return

    const text = await res.text()
    window.__ENV = window.__ENV || {}

    for (const line of text.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      const val = trimmed.slice(eq + 1).trim()
      window.__ENV[key] = val
    }
  } catch {
    // .env not present or server error — silent fail
  }
}
