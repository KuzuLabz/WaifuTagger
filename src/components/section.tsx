import { Pressable, View } from 'react-native';
import { InferenceTag, InferenceTags } from '../types';
import { Text, useTheme } from 'react-native-paper';
import Result from './result';
import { copyToClipboard } from '../utils';

type RatingsProps = {
	title: 'Character' | 'Ratings' | 'General';
	tags?: InferenceTags['rating'];
	onTagSelect: (tag: InferenceTag) => void;
};
const ResultSection = ({ tags, title, onTagSelect }: RatingsProps) => {
	const { colors } = useTheme();
	if (!tags) return;
	return (
		<View style={{ marginVertical: 10 }}>
			<View style={{ marginLeft: 10, flexDirection: 'row', alignItems: 'center' }}>
				<Text variant="headlineSmall">{title}</Text>
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
					<Text>No Results</Text>
				)}
			</View>
		</View>
	);
};

export default ResultSection;
