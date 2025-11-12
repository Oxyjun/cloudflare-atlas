// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
	site: "https://cloudflare-atlas.pcx-team.workers.dev",
	integrations: [mdx(), sitemap()],
	output: "server",
	adapter: cloudflare({
		platformProxy: {
			enabled: true,
		},
	}),
	vite: {
		build: {
			rollupOptions: {
				external: [],
				output: {
					inlineDynamicImports: false,
					manualChunks: undefined,
				}
			}
		},
		resolve: {
			alias: {
				'@': '/src'
			}
		}
	}
});
