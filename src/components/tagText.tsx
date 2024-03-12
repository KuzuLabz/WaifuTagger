import { Text, Surface, IconButton } from 'react-native-paper';
import { copyToClipboard } from '../utils';
import { Share, View } from 'react-native';

type TagTextProps = {
	text: string;
};
const TagText = ({ text }: TagTextProps) => {
	return (
		<Surface style={{ margin: 10, borderRadius: 12, padding: 10, paddingBottom: 0 }}>
			<Text>{text}</Text>
			<View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
				<IconButton
					icon="share-variant"
					onPress={() => Share.share({ message: text })}
					style={{ alignSelf: 'flex-end' }}
				/>
				<IconButton
					icon="content-copy"
					onPress={() => copyToClipboard(text)}
					style={{ alignSelf: 'flex-end' }}
				/>
			</View>
		</Surface>
	);
};

export default TagText;
