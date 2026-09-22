import { M3eExpandableListItem, M3eListAction } from "@m3e/react/list";
import { M3eRadio } from '@m3e/react/radio-group';
import { useState } from "react";
import { LANGUAGES } from "../constants";
import { useLingui } from "@lingui/react/macro";
import { i18n } from "@lingui/core";
import { dynamicActivate } from "../locale";
import { useSettingsStore } from "../store/settings";

const LanguageItem = ({ lang, onSelect }: { lang: string; onSelect: (locale: string) => Promise<void> }) => {
    
    return(
        <M3eListAction onClick={async () => await onSelect(lang)}>
            {LANGUAGES[lang]}
            <span slot="trailing">
                <M3eRadio checked={i18n.locale === lang} />
            </span>
        </M3eListAction>
    );
};

export const LanguageList = () => {
    const [open, setOpen] = useState(false);
    const lang = useSettingsStore(state => state.language);
    const updateSettings = useSettingsStore(state => state.updateSettings);

    const { t } = useLingui();

    const onSelect = async (locale: string) => {
        updateSettings({language: locale});
        await dynamicActivate(locale);
    };

    return(
        <M3eExpandableListItem open={open} onClick={() => setOpen(state => !state)}>
            {t`Language`}
            <span slot="supporting-text">{LANGUAGES[lang]}</span>
            <div slot="items">
                {Object.keys(LANGUAGES).map((local, idx) => 
                    <LanguageItem key={idx} lang={local} onSelect={onSelect}  />
                )}
            </div>
            
        </M3eExpandableListItem>
    );
};