import { router, Slot, useRootNavigationState } from "expo-router";
import { useEffect } from "react";
import { useSettingsStore } from "../../store/settings";
import { AppUpdater } from "../../utils/update";
import { useModelsStore } from "../../store/models";

const RootLayout = () => {
    useEffect(() => {
        const initializeApp = async () => {
            const isNew = useSettingsStore.getState().isNewUser;
            const selected = useModelsStore.getState().selected;
            const autoUpdate = useSettingsStore.getState().autoUpdate;

            // Remove cached apk
            AppUpdater.clean();
            
            if (isNew || !selected) {
                router.replace('/models');
                return;
            }

            if (autoUpdate) {
                try {
                    const update = await AppUpdater.checkForUpdate();
                    if (update) {
                        router.navigate({
                            pathname: '(dialogs)/updateChecker',
                            params: update
                        });
                        return;
                    }
                } catch (e) {
                    console.warn(e);
                    return;
                }
            }
        };
        
        initializeApp();
    },[]);

  return <Slot />;
}

export default RootLayout;