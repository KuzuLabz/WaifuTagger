import { Dialog } from "../../components/dialogs/dialog";
import { SettingsContent } from "../../components/content/settings";
import { ScrollViewStyled } from "../../components/scrollview";
import { useLingui } from "@lingui/react/macro";

const SettingsDialog = () => {
    const { t } = useLingui();

    return (
        <Dialog 
            visible={true} 
            title={t`Settings`}
            actions={[{title: t`Close`}]}
        >
            <ScrollViewStyled contentContainerStyle={{paddingHorizontal: 12}}>
                <SettingsContent />
            </ScrollViewStyled>
        </Dialog>
    );
};

export default SettingsDialog;