import { i18n } from "@lingui/core";

/**
 * We do a dynamic import of just the catalog that we need
 * @param locale any locale string
 */
export const dynamicActivate = async (locale: string) => {
  const { messages } = await import(`./locales/${locale}/messages`);
  i18n.load(locale, messages);
  i18n.activate(locale);
}