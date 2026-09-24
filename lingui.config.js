import { defineConfig } from "@lingui/cli";

export default defineConfig({
    sourceLocale: "en",
    locales: ["en", "es", "fr", "de", "zh-CN", "zh-TW", "ja", "ko"],
    fallbackLocales: {
        "zh-CN": 'zh',
        "zh-HK": "zh-TW",
        default: 'en'
    },
    catalogs: [
        {
            path: "./locales/{locale}/messages",
            include: ["src"],
        },
    ],
});