/**
 * Build-time constants injected by `define` in `vite.config.ts`.
 */

/**
 * True in the static portal build (`npm run build:portal`), false in the
 * default Vercel SSR build. Use it to strip anything that depends on Vercel
 * platform endpoints — those 404 when the bundle is served from Poki,
 * CrazyGames or itch.io.
 */
declare const __PORTAL_BUILD__: boolean;
