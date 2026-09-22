import { defineConfig } from "@lingui/cli";

export default defineConfig({
    sourceLocale: "en",
    locales: ["en", "es", "fr", "de", "zh", "ja", "ko"],
    catalogs: [
        {
            path: "./locales/{locale}/messages",
            include: ["src"],
        },
    ],
});