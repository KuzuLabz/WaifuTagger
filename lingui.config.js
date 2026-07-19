import { defineConfig } from "@lingui/cli";

export default defineConfig({
    sourceLocale: "en",
    locales: ["en", "es", "fr", "de", "zh", "ja"],
    catalogs: [
        {
            path: "./locales/{locale}/messages",
            include: ["src"],
        },
    ],
});