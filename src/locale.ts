import { i18n } from "@lingui/core";

const loaders: Record<string, () => Promise<any>> = {
    de: () => import('../locales/de/messages'),
    en: () => import('../locales/en/messages'),
    es: () => import('../locales/es/messages'),
    fr: () => import('../locales/fr/messages'),
    ja: () => import('../locales/ja/messages'),
    ko: () => import('../locales/ko/messages'),
    zh: () => import('../locales/zh/messages')
};

export const dynamicActivate = async (locale: string) => {
    const { messages } = await (loaders[locale] ?? loaders['en'])();
    i18n.load(locale, messages);
    i18n.activate(locale);
}