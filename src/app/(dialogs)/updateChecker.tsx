import { useLocalSearchParams } from "expo-router";
import { Dialog } from "../../components/dialogs/dialog";
import { UpdateDetails } from "../../utils/update/types";
import { useLingui } from "@lingui/react/macro";
import { ScrollViewStyled } from "../../components/scrollview";
import { useAppTheme } from "../../providers/theme";
import { Markdown } from "../../components/markdown";

const UpdateDialog = () => {
    const { version, body, url } = useLocalSearchParams<UpdateDetails>();

    const { colors } = useAppTheme();
    const { t } = useLingui();

    const onUpdate = () => null;

    return (
        <Dialog 
            visible={true} 
            title={t`App Update`} 
            scrollable
            actions={[{title: t`Skip`}, {title: t`Update`, onPress: onUpdate, autoDismiss: false}]}
        >
            <ScrollViewStyled>
                <Markdown>
                    {body}
                </Markdown>
            </ScrollViewStyled>
        </Dialog>
    );
};

export default UpdateDialog;