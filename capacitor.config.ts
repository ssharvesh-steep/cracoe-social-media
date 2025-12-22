import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.cracoe.socialmedia',
    appName: 'CRACOE',
    webDir: 'public',
    server: {
        url: 'https://cracoe-social-media.vercel.app',
        cleartext: false
    },
    android: {
        buildOptions: {
            keystorePath: undefined,
            keystoreAlias: undefined,
        }
    }
};

export default config;
