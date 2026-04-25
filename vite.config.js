import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

import { cloudflare } from "@cloudflare/vite-plugin";

function loadAppConfig() {
  const defaultLocalConfigPath = path.resolve(process.cwd(), 'appconfig.local.json');

  if (process.env.APP_CONFIG_JSON) {
    return JSON.parse(process.env.APP_CONFIG_JSON);
  }

  if (process.env.APP_CONFIG_PATH) {
    const configPath = path.resolve(process.cwd(), process.env.APP_CONFIG_PATH);
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }

  if (fs.existsSync(defaultLocalConfigPath)) {
    return JSON.parse(fs.readFileSync(defaultLocalConfigPath, 'utf8'));
  }

  return null;
}

export default defineConfig(() => {
  let injectedAppConfig = null;

  try {
    injectedAppConfig = loadAppConfig();
  } catch (error) {
    throw new Error(`Failed to load app config for build: ${error.message}`);
  }

  return {
    plugins: [svelte(), cloudflare()],
    define: {
      __APP_CONFIG__: JSON.stringify(injectedAppConfig)
    }
  };
});