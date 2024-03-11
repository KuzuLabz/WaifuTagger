import { Linking, View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';

const Footer = () => {
	return (
		<View style={{ justifyContent: 'flex-end', alignItems: 'center', marginTop: 50 }}>
			<View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
				<IconButton
					icon="earth"
					onPress={() => Linking.openURL('https://www.kuzulabz.com/')}
				/>
				<IconButton
					icon="github"
					onPress={() => Linking.openURL('https://github.com/KuzuLabz')}
				/>
			</View>
			<Text>Created by KuzuLabz ❤️</Text>
		</View>
	);
};

export default Footer;
