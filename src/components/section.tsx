import { Pressable, View } from 'react-native';
import { InferenceTag, InferenceTags } from '../types';
import { Text, useTheme } from 'react-native-paper';
import Result from './result';
import { copyToClipboard } from '../utils';
import { useLingui } from '@lingui/react/macro';

type TitleType = 'Character' | 'Ratings' | 'General';
type RatingsProps = {
	title: TitleType;
	tags?: InferenceTags['rating'];
	onTagSelect: (tag: InferenceTag) => void;
};
const ResultSection = ({ tags, title, onTagSelect }: RatingsProps) => {
	const { colors } = useTheme();
    const { t } = useLingui();

    const titleTranslations: Record<TitleType, string> = {
        Character: t`Character`,
        Ratings: t`Ratings`,
        General: t`General`,
    };

	if (!tags) return;
	return (
		<View style={{ marginVertical: 10 }}>
			<View style={{ marginLeft: 10, flexDirection: 'row', alignItems: 'center' }}>
				<Text variant="headlineSmall">{titleTranslations[title]}</Text>
				{title === 'General' && (
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
				)}
			</View>
			<View style={{ alignSelf: 'center', width: '95%', padding: 10 }}>
				{tags.length > 0 ? (
					tags.map((tag, idx) => (
						<Pressable
							key={idx}
							onPress={() => {
								tag.category !== 9 && onTagSelect(tag);
							}}
							onLongPress={() => copyToClipboard(tag.name)}
							disabled={title === 'Ratings'}
						>
							<Result {...tag} />
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
