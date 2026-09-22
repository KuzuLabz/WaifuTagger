import { useLingui } from '@lingui/react/macro';
import { View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import { openBrowser } from '../utils/utils';

const Footer = () => {
    const { t } = useLingui();
    
	return (
		<View
			style={{
				flex: 1,
				justifyContent: 'flex-end',
				alignItems: 'center',
				marginTop: 50,
				paddingBottom: 10,
				height: '100%',
			}}
		>
			<View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
				<IconButton
					icon="earth"
					onPress={() => openBrowser('https://www.kuzulabz.com/', undefined, 'KuzuLabz')}
				/>
				<IconButton
					icon="github"
					onPress={() => openBrowser('https://github.com/KuzuLabz/WaifuTagger', undefined, t`Source code`)}
				/>
			</View>
			<Text selectable={false}>{t`Created by KuzuLabz ❤️`}</Text>
		</View>
	);
};

export default Footer;
