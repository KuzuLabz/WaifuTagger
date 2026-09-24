import { useLocalSearchParams } from "expo-router";
import { useLingui } from "@lingui/react/macro";
import { Dialog } from "../../components/dialogs/dialog";
import { Button } from "react-native-paper";
import { BOORU_URL, KAOMOJIS } from "../../constants";
import { openBrowser } from "../../utils/utils";
import { InferenceTag } from "../../types";
import { useAppTheme } from "../../providers/theme";
import { useStatsStore } from "../../store/stats";
import { List, ListItem } from "../../components/common/list";

const TagDialog = () => {
    const {tagJson} = useLocalSearchParams<{tagJson:string}>();
    const tag = JSON.parse(tagJson) as InferenceTag;

    const { colors } = useAppTheme();
    const { t } = useLingui();
    const isRankEnabled = useStatsStore(state => state.isEnabled);

    const label = tag?.label ?? '';

	if (!tag) return null;

	return (
		<Dialog 
            visible={true} 
            title={typeof tag.label === 'string'
					? KAOMOJIS.includes(tag.label)
						? tag.label
						: tag.label.replaceAll('_', ' ')
					: tag.label}
            actions={[{title: t`Done`}]}
        >
			<List>
                <ListItem
                    title={t`Probability`} 
                    mode="item" 
                    description={(tag.probability * 100).toFixed(2) + ' %'} 
                    leadingIcon={{web: 'percent', native: 'percent'}}
                />
                {isRankEnabled && <ListItem 
                    title={t`Rank`} 
                    mode="item" 
                    description={tag.rank?.rank ?? ''} 
                    leadingIcon={{web: 'trophy', native: 'trophy'}} 
                />}
                <ListItem 
                    title={t`Tag count`} 
                    mode="item" 
                    description={tag.count.toLocaleString()} 
                    leadingIcon={{native: 'tag-multiple', web: 'style'}}
                />
            </List>
            <Button
                mode="contained-tonal"
                onPress={() =>
                    openBrowser(`${BOORU_URL}/wiki_pages/${label}`, {
                        toolbarColor: colors.surfaceContainer,
                        showTitle: true,
                    }, t`Wiki - ${label}`)
                }
                style={{marginTop: 6}}
            >
                {t`View Wiki`}
            </Button>
		</Dialog>
	);
};

export default TagDialog;