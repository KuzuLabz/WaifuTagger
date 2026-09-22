import { Column, Host, ScrollView, Spacer, Text } from "@expo/ui";
import { router, useLocalSearchParams } from "expo-router";
import { UpdateDetails } from "../../utils/update/types";
import { useAppTheme } from "../../providers/theme";
import { useLingui } from "@lingui/react/macro";
import { fillMaxWidth, weight } from "@expo/ui/jetpack-compose/modifiers";
import { useState } from "react";
import { Divider } from "../../components/common/divider";
import { AppUpdater } from "../../utils/update";
import { BottomSheet } from "../../components/common/bottomsheet";
import { NativeButton } from "../../components/common/button";
import { ProgressBar } from "../../components/common/progressBar";
import { Markdown } from "../../components/markdown";
import { SideSheet } from "../../components/dialogs/sidesheet";
import { useWindowWidthClass, WindowWidthClass } from "../../hooks/useWindowWidthClass";

const UpdateSideSheet = ({body, progress, onUpdate}: {body: string; progress: number | undefined; onUpdate: () => Promise<void>}) => {
    const { t } = useLingui();
    const [present, setPresent] = useState(true);

    const onDismiss = () => {
        setPresent(false);
        // wait for sheet animation
        (new Promise(resolve => setTimeout(resolve, 100))).then(() => {
            router.back();
        });
    };

    return(
        <SideSheet 
            title={t`App Update`} 
            isPresented={present} 
            actionHeader={progress !== undefined && <ProgressBar hosted value={progress} indeterminate={true} />} 
            scrollable
            onDismiss={onDismiss}
            actions={[
                {
                    title: t`Update`,
                    onPress: onUpdate,
                    disabled: progress > 0,
                    mode: 'contained',
                },
                {
                    title: t`Skip`,
                    onPress: onDismiss,
                    disabled: progress > 0,
                    mode: 'outlined'
                }
            ]}
        >
            <Markdown>
                {body}
            </Markdown>
        </SideSheet>
    );
};

const UpdateDialog = () => {
    const { version, body, url } = useLocalSearchParams<UpdateDetails>();
    const { fonts, dark, colors } = useAppTheme();
    const { t } = useLingui();
    const sizeClass = useWindowWidthClass();

    const [isPresented, setIsPresented] = useState(true);
    const [progress, setProgress] = useState<number | undefined>(undefined);

    const onDismiss = () => {
        setIsPresented(false);

        // wait for sheet animation
        (new Promise(resolve => setTimeout(resolve, 100))).then(() => {
            router.back();
        });
    };

    const onUpdate = async () => {
        if (progress !== undefined) {
            return;
        }
        await AppUpdater.startUpdate(url, version, () => setProgress(0), (val) => setProgress(val), () => setProgress(1));
    };

    if (sizeClass !== WindowWidthClass.Compact) {
        return(
            <UpdateSideSheet body={body} progress={progress} onUpdate={onUpdate} />
        );
    }

    return (
        <Host style={{ flex: 1 }} colorScheme={dark ? 'dark' : 'light'} seedColor={colors.primary}>
            <BottomSheet isPresented={isPresented} onDismiss={onDismiss} snapPoints={['full']}>
                <Column spacing={12} modifiers={[weight(1)]}>
                    <Text textStyle={{...fonts.headlineMedium, color: colors.onSurface}}>{t`App Update`}</Text>
                    <Spacer size={6} />
                    <ScrollView>
                        <Markdown>
                            {body}
                        </Markdown>
                    </ScrollView>
                </Column>
                <Column spacing={8}>
                    <Divider />
                    <Column style={{height: 8}} hidden={!progress}>
                        <ProgressBar value={progress} indeterminate={false} />
                    </Column>
                    <NativeButton label={t`Update`} onPress={onUpdate} modifiers={[fillMaxWidth()]} variant="filled" />
                    <NativeButton label={t`Skip`} onPress={onDismiss} modifiers={[fillMaxWidth()]} variant="outlined" />
                </Column>
            </BottomSheet>
        </Host>
    );
};

export default UpdateDialog;