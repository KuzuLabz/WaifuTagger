import { Pressable, View } from 'react-native';
import { InferenceTag, InferenceTags } from '../types';
import { Chip, Headline, Text, useTheme } from 'react-native-paper';
import Result from './result';
import { copyToClipboard } from '../utils';

type RatingsProps = {
	title: string;
	tags?: InferenceTags['rating'];
	onTagSelect: (tag: InferenceTag) => void;
};
const ResultSection = ({ tags, title, onTagSelect }: RatingsProps) => {
	const { colors } = useTheme();
	if (!tags) return;
	return (
		<View style={{ marginVertical: 10 }}>
			<View style={{ marginLeft: 10, flexDirection: 'row', alignItems: 'center' }}>
				<Headline>{title}</Headline>
				{title === 'General Tags' && (
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
			<View
				style={{
					alignSelf: 'center',
					width: '95%',
					padding: 10,
				}}
			>
				{/* {!tags ? (
                    <Text style={{ textAlign: 'center' }}>
                        Select image and run inference to see results!
                    </Text>
                ) : (
                    ratings.map((rating, idx) => (
                        <Result key={idx} probability={rating.probability} />
                    ))
                )} */}
				{/* <Result probability={0.8} name="General" />
                <Result probability={0.2} name="Sensitive" />
                <Result probability={0} name="Questionable" />
                <Result probability={0} name="Explicit" /> */}
				{tags.length > 0 ? (
					tags?.map((tag, idx) => (
						<Pressable
							key={idx}
							onPress={() => {
								tag.category !== 9 && onTagSelect(tag);
							}}
							onLongPress={() => copyToClipboard(tag.name)}
						>
							<Result probability={tag.probability} name={tag.name} />
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
