import { Text, Surface, IconButton } from 'react-native-paper';
import { copyToClipboard } from '../utils';

type TagTextProps = {
	text: string;
};
const TagText = ({ text }: TagTextProps) => {
	return (
		<Surface style={{ margin: 10, borderRadius: 12, padding: 10, paddingBottom: 0 }}>
			<Text>{text}</Text>
			<IconButton
				icon="content-copy"
				onPress={() => copyToClipboard(text)}
				style={{ alignSelf: 'flex-end' }}
			/>
		</Surface>
	);
};

export default TagText;
