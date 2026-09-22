import { Pressable, View } from 'react-native';
import { InferenceTag, InferenceTags } from '../types';
import { Text, useTheme } from 'react-native-paper';
import Result from './result';
import { copyToClipboard } from '../utils/utils';
import { useLingui } from '@lingui/react/macro';
import { ModelSettings } from '../store/models';
import { useStatsStore } from '../store/stats';
import { useCategoryTitles } from '../hooks/translations/useCategoryTitles';

type RatingsProps = {
	title: keyof ModelSettings['thresholds'];
	tags?: InferenceTags['rating'];
	onTagSelect: (tag: InferenceTag) => void;
};

const nonBooruTags:(keyof ModelSettings['thresholds'])[] = ['year', 'rating']

const ResultSection = ({ tags, title, onTagSelect }: RatingsProps) => {
	const { colors } = useTheme();
    const { t } = useLingui();
    const categoryTrans = useCategoryTitles();
    const isRankEnabled = useStatsStore((state) => state.isEnabled);

	if (!tags) return;

	return (
		<View style={{ marginVertical: 10 }}>
			<View style={{ marginLeft: 10, flexDirection: 'row', alignItems: 'center' }}>
				<Text variant="headlineSmall">{categoryTrans[title]}</Text>
				<View
                    style={{
                        backgroundColor: colors.surfaceVariant,
                        padding: 2,
                        paddingHorizontal: 5,
                        borderRadius: 6,
                        maxHeight: 24,
                        marginLeft: 5,
                    }}
                >
                    <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
                        {tags.length}
                    </Text>
                </View>
			</View>
			<View style={{ alignSelf: 'center', width: '95%', padding: 10 }}>
				{tags.length > 0 ? (
					tags.map((tag, idx) => (
						<Pressable
							key={idx}
							onPress={() => {
								!nonBooruTags.includes(title) && onTagSelect(tag);
							}}
							onLongPress={() => copyToClipboard(tag.label)}
							disabled={title === 'rating'}
						>
							<Result {...tag} rank={isRankEnabled ? tag.rank : undefined} />
						</Pressable>
					))
				) : (
					<Text>{t`No Results`}</Text>
				)}
			</View>
		</View>
	);
};

export default ResultSection;
