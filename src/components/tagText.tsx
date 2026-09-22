import { IconButton, Chip, Tooltip, Divider, Text } from 'react-native-paper';
import { copyToClipboard, shareText } from '../utils/utils';
import { Platform, Pressable, TextStyle, View, ViewStyle } from 'react-native';
import { useFormattedTags } from '../hooks/useFormattedText';
import { InferenceTag, InferenceTags, TagCategories, TagCategoryType, TextFormat } from '../types';
import { ReactNode, useEffect, useState } from 'react';
import { useLingui } from '@lingui/react/macro';
import { useAppTheme } from '../providers/theme';
import Animated, { SequencedTransition, useAnimatedStyle, useSharedValue, withRepeat, withTiming, } from 'react-native-reanimated';
import { getCurrentPlatform } from '../utils/platform';
import { useSettingsStore } from '../store/settings';
import { canShare } from '@vnidrop/tauri-plugin-share';
import { CATEGORY_COLORS } from '../constants';
import { router } from 'expo-router';
import { ButtonGroup } from './common/buttonGroup';
import { useStatsStore } from '../store/stats';
import { useCategoryTitles } from '../hooks/translations/useCategoryTitles';

type CategoryConfig = {
    key: TagCategoryType;
    getIcon: (isSelected: boolean) => string;
    getIconColor: (theme: string, colors: any, isSelected: boolean) => string;
    getContainerColor: (theme: string, colors: any, isSelected: boolean) => string | undefined;
};

const CATEGORY_CONFIG: CategoryConfig[] = [
    {
        key: 'artist',
        getIcon: () => 'palette',
        getIconColor: (theme) => CATEGORY_COLORS[theme].artist.color,
        getContainerColor: (theme) => CATEGORY_COLORS[theme].artist.backgroundColor,
    },
    {
        key: 'character',
        getIcon: (selected) => (selected ? 'account' : 'account-outline'),
        getIconColor: (theme) => CATEGORY_COLORS[theme].character.color,
        getContainerColor: (theme) => CATEGORY_COLORS[theme].character.backgroundColor,
    },
    {
        key: 'copyright',
        getIcon: () => 'copyright',
        getIconColor: (theme) => CATEGORY_COLORS[theme].copyright[theme === 'dark' ? 'color' : 'backgroundColor'],
        getContainerColor: (theme) => CATEGORY_COLORS[theme].copyright.backgroundColor,
    },
    {
        key: 'general',
        getIcon: () => 'tag-multiple-outline',
        getIconColor: (theme) => CATEGORY_COLORS[theme].general.color,
        getContainerColor: (theme) => CATEGORY_COLORS[theme].general.backgroundColor,
    },
    {
        key: 'meta',
        getIcon: () => 'code-braces',
        getIconColor: (theme) => CATEGORY_COLORS[theme].meta.color,
        getContainerColor: (theme) => CATEGORY_COLORS[theme].meta.backgroundColor,
    },
    {
        key: 'rating',
        getIcon: (selected) => (selected ? 'thermometer-check' : 'thermometer-minus'),
        getIconColor: (_, colors) => colors.onSurface,
        getContainerColor: (_, colors) => colors.surface,
    },
    {
        key: 'year',
        getIcon: (selected) => (selected ? 'calendar' : 'calendar-minus'),
        getIconColor: (_, colors) => colors.onSurface,
        getContainerColor: (_, colors) => colors.surface,
    },
];

const PulseText = ({ children, isLoading, style }: {children: string; isLoading: boolean; style: TextStyle}) => {
    const opacity = useSharedValue(1);

    useEffect(() => {
        if (isLoading) {
            opacity.value = withRepeat(withTiming(0.35, { duration: 700 }), -1, true);
        } else {
            opacity.value = withTiming(1, { duration: 200 });
        }
    }, [isLoading]);

    const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.Text style={[style, animatedStyle]}>{children}</Animated.Text>;
}

const PulseView = ({ children, isLoading, style }: {children: ReactNode | ReactNode[]; isLoading: boolean; style?: ViewStyle}) => {
    const opacity = useSharedValue(1);

    useEffect(() => {
        if (isLoading) {
            opacity.value = withRepeat(withTiming(0.35, { duration: 700 }), -1, true);
        } else {
            opacity.value = withTiming(1, { duration: 200 });
        }
    }, [isLoading]);

    const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}

type ControlBarProps = {
    text?: string;
    categories: Record<TagCategoryType, boolean>;
};
const ControlBar = ({ text, categories }: ControlBarProps) => {
    const platform = getCurrentPlatform();
    const { colors, dark } = useAppTheme();
    const { t } = useLingui();
    const toggleIncluded = useSettingsStore((state) => state.toggleIncluded);
    const order = useSettingsStore((state) => state.categoryOrder);
    const included = useSettingsStore((state) => state.included);
    const [isVis, setIsVis] = useState(false);
    const [isSharable, setIsSharable] = useState(platform === 'mobile' || platform === 'web');
    const catTitles = useCategoryTitles();

    const theme = dark ? 'dark' : 'light';

    const configMap = new Map(CATEGORY_CONFIG.map((item) => [item.key, item]));
    const orderedCategories = order
            .filter((item) => item.enabled)
            .map((item) => configMap.get(item.category))
            .filter((config): config is CategoryConfig => config !== undefined);

    useEffect(() => {
        if (platform === 'desktop') {
            canShare().then((v) => setIsSharable(v));
        }
    },[])

    return(
        <View style={{flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', backgroundColor: colors.surfaceContainer, borderRadius: 12}}>
            {orderedCategories.map(({ key, getIcon, getIconColor, getContainerColor }) => {
                const isSelected = Boolean(included[key]);
                const isCategoryActive = Boolean(categories[key]);

                return (
                    <Tooltip key={key} title={`${catTitles[key]}`} leaveTouchDelay={100}>
                        <IconButton
                            icon={getIcon(isSelected)}
                            onPress={() => toggleIncluded(key)}
                            selected={isSelected}
                            disabled={!isCategoryActive}
                            iconColor={getIconColor(theme, colors, isSelected)}
                            containerColor={isSelected && isCategoryActive ? getContainerColor(theme, colors, isSelected) : undefined}
                            style={{ alignSelf: 'flex-end' }}
                        />
                    </Tooltip>
                );
            })}
            {getCurrentPlatform() === 'mobile' ?
                null
                :
                <>
                    <View style={{width: 2, height: 35, backgroundColor: colors.outlineVariant}} />
                    {isSharable && <Tooltip title={t`Share`} leaveTouchDelay={100}>
                        <IconButton
                            icon={'share-variant'}
                            onPress={() => shareText(text)}
                            disabled={!isSharable}
                            style={{ alignSelf: 'flex-end' }}
                        />
                    </Tooltip>}
                    <Tooltip title={t`Copy text`} leaveTouchDelay={100}>
                        <IconButton
                            icon={'content-copy'}
                            onPress={() => copyToClipboard(text)}
                            style={{ alignSelf: 'flex-end' }}
                        />
                    </Tooltip>
                </>
            }
        </View>
    );
};

type IconActionViewProps = {
	text?: string;
	setFormat: () => void;
};
const IconActionView = ({
	text,
	setFormat,
}: IconActionViewProps) => {
    const { t } = useLingui();
    const format = useSettingsStore((state) => state.textFormat);
    const plainText = useSettingsStore(state => state.tagPlainText);
    const updateSettings = useSettingsStore(state => state.updateSettings);

    const TextFormatNames: Record<TextFormat, string> = {
        'prompt': t`Prompt`,
        'space': t`Space`,
        'underscore': t`Underscore`
    };
    const visualOptions = [t`Text`, t`Styled`];

    const onVisualChange = (idx: number) => {
        updateSettings({tagPlainText: idx === 0})
    };

	return (
				<View
					style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingBottom: 12, paddingTop: 6 }}
				>
					
                    <View style={{flex: 1}}>
                        <ButtonGroup 
                            selectedIndex={plainText ? 0 : 1} 
                            onValueChange={onVisualChange} 
                            actions={visualOptions.map((v) => ({label: v}))} 
                        />
                    </View>
					<Tooltip title="Format" leaveTouchDelay={100}>
						<Chip
							compact
							mode="outlined"
							onPress={setFormat}
							textStyle={{ textTransform: 'capitalize' }}
						>
							{TextFormatNames[format]}
						</Chip>
					</Tooltip>
				</View>
    );
};

const TagItem = ({tag, category, textColor, subtitleColor, bgColor, showRank, rankBgColor, rankColor}: {tag: InferenceTag; category: TagCategoryType; textColor: string; subtitleColor: string; bgColor: string; showRank: boolean; rankBgColor: string; rankColor: string}) => {
    return(
        <Animated.View layout={SequencedTransition.duration(200)} style={{ overflow: 'hidden', backgroundColor: bgColor, borderWidth: 0.5, borderColor: textColor,  borderRadius: 6}}>
            <Pressable 
                style={{paddingHorizontal: 8, paddingVertical: 4, flexDirection: 'row', alignItems: 'center'}} 
                onPress={() => router.navigate({ pathname: '/(dialogs)/tag', params: { tagJson: JSON.stringify(tag) } })}
                onLongPress={() => Platform.OS !== 'web' ? copyToClipboard(tag.label) : null}
                disabled={(category === 'rating' || category === 'year')}
            >
                <Text variant={Platform.OS !== 'web' ? 'labelMedium' : undefined} style={{color: textColor,}}>
                    {tag.label}
                </Text>
                <View style={{paddingLeft: 6,}}>
                        <Text variant='labelSmall' style={{color: subtitleColor}}>{(tag.probability * 100).toFixed(0)}%</Text>
                    </View>
                    {tag.rank && showRank && <View style={{ marginLeft: 6, paddingHorizontal: 6, paddingVertical: 1, borderRadius:4, backgroundColor: rankBgColor}}>
                        <Text variant='labelSmall' style={{color: rankColor}}>{tag.rank.rank}</Text>
                    </View>}
            </Pressable>
        </Animated.View>
    );
};
type TagTextProps = {
	tags: InferenceTags;
    isLoading: boolean;
};
const TagText = ({ tags, isLoading }: TagTextProps) => {
    const { colors, dark } = useAppTheme();
    const { t } = useLingui();
	const { formattedTags, text, setFormat } = useFormattedTags(tags);
    const isPlainText = useSettingsStore(state => state.tagPlainText);
    const rankEnabled = useStatsStore(state => state.isEnabled);

    const categoryKeys = Object.keys(formattedTags);
    const categories = Object.fromEntries(
        Object.keys(TagCategories).map(key => [
            key, 
            tags[key as TagCategoryType]?.length > 0
        ])
    ) as Record<TagCategoryType, boolean>;

    const theme = dark ? 'dark' : 'light';

    const tagData = tags && formattedTags ? categoryKeys
      .filter((cat) => cat !== 'rank')
      .flatMap((cat) =>
        (formattedTags[cat as TagCategoryType] ?? []).map((it) => ({
          id: `${cat}-${it.label}`,
          tag: it,
          category: cat as TagCategoryType,
          textColor: CATEGORY_COLORS[theme][cat as TagCategoryType]?.color ?? colors.onSurface,
          bgColor: CATEGORY_COLORS[theme][cat as TagCategoryType]?.backgroundColor ?? colors.surfaceContainer,
        }))
      ) : null;

	return (
		<View style={{paddingBottom: 12}}>
            <View style={{ backgroundColor: colors.surfaceContainer, margin: 10, borderRadius: 12, padding: 10, paddingBottom: 0 }}>
                
                {isPlainText ? 
                    <PulseText
                        isLoading={isLoading}
                        style={{ color: colors.onSurface }}
                    >
                        {text}
                    </PulseText>
                    :
                    <PulseView isLoading={isLoading} style={{gap: 8, flexDirection: 'row', flexWrap: 'wrap', padding: 6, borderRadius: 12}}>
                        {tagData.map((item) => (
                            <TagItem
                                key={item.id}
                                tag={item.tag}
                                category={item.category}
                                textColor={item.textColor}
                                subtitleColor={(item.textColor === colors.onSurface || dark) ? colors.onSurfaceVariant : colors.surface}
                                bgColor={item.bgColor}
                                showRank={rankEnabled}
                                rankColor={colors.onSurface}
                                rankBgColor={colors.surfaceContainerLow}
                            />
                        ))}
                    </PulseView>
                }
                {Platform.OS !== 'web' && 
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12}}>
                        <View style={{paddingLeft: 10}}>
                            <Text variant='labelLarge' style={{color: colors.onSurface}}>{t`${tagData.length} Tags`}</Text>
                        </View>
                        <View style={{flexDirection: 'row'}}>
                            <IconButton icon={'share-variant'} onPress={() => shareText(text)} />
                            <IconButton icon={'content-copy'} onPress={() => copyToClipboard(text)} />
                        </View>
                    </View>
                }
                <View
                    style={{
                        paddingTop: 6,
                        gap: 6
                    }}
                >
                    <Divider />
                    <IconActionView
                        text={text}
                        setFormat={setFormat}
                    />
                </View>
            </View>
            <View style={{paddingHorizontal: 10}}>
                <ControlBar text={text} categories={categories} />
            </View>
        </View>
	);
};

export default TagText;
