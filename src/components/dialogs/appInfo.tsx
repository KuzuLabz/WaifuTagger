import { Dialog, Divider, Text } from 'react-native-paper';
import { useAppTheme } from '../../theme';
import { Linking, Platform, View } from 'react-native';
import { BasicDialogProps } from './types';
import { DialogStyled } from './dialog';
import { Button } from '../common/button';

type LinkTextProps = {
	label: string;
	url: string;
	linkColor: string;
};

const LinkText = ({ label, url, linkColor }: LinkTextProps) => {
	return (
		<Text
			style={{ color: linkColor, textDecorationLine: 'underline' }}
			onPress={() => Linking.openURL(url)}
		>
			{label}
		</Text>
	);
};

const WebDescription = ({ linkColor }: { linkColor: string }) => {
	return (
		<>
			<Text>
				{"This app uses p1atdev's quantized "}
				<LinkText
					label="WD SwinV2 Tagger v3"
					url="https://huggingface.co/p1atdev/wd-swinv2-tagger-v3-hf"
					linkColor={linkColor}
				/>{' '}
				model {'('}
				{'Based on SmilingWolfs '}
				<LinkText
					label="model"
					url="https://huggingface.co/SmilingWolf/wd-swinv2-tagger-v3"
					linkColor={linkColor}
				/>
				{').'}
			</Text>
		</>
	);
};
const MobileDescription = ({ linkColor }: { linkColor: string }) => {
	return (
		<>
			<Text>
				This app uses an optimized version of SmilingWolfs{' '}
				<LinkText
					label="wd-convnext-tagger-v3"
					url="https://huggingface.co/SmilingWolf/wd-convnext-tagger-v3"
					linkColor={linkColor}
				/>{' '}
				model.
			</Text>
			<Text>
				{'\n'}If you would like to know more about the optimized model, check out the model
				card{' '}
				<LinkText
					label="here"
					url="https://huggingface.co/Smashinfries/wd-convnext-tagger-v3-mobile"
					linkColor={linkColor}
				/>
				{'!'}
			</Text>
		</>
	);
};

const Description = ({ linkColor }: { linkColor: string }) => {
	return Platform.select({
		web: <WebDescription linkColor={linkColor} />,
		native: <MobileDescription linkColor={linkColor} />,
	});
};

export const AppInfo = ({ visible, onDismiss }: BasicDialogProps) => {
	const { colors } = useAppTheme();
	return (
		<DialogStyled visible={visible} onDismiss={onDismiss}>
			<Dialog.Title selectable={false}>About</Dialog.Title>
			<Dialog.Content>
				<View>
					<Description linkColor={colors.primary} />
					<Divider style={{ marginVertical: 20 }} />
					<Text style={{ fontWeight: '900' }}>Only PNG and JPEG images can be used.</Text>
				</View>
			</Dialog.Content>
			<Dialog.Actions>
				<Button androidVariant="borderless" webVariant="text" onPress={onDismiss}>
					Close
				</Button>
			</Dialog.Actions>
		</DialogStyled>
	);
};
