import { View } from 'react-native';
import { Dialog, IconButton, Text } from 'react-native-paper';
import { IconSource } from 'react-native-paper/lib/typescript/components/Icon';
import { copyToClipboard, openBrowser } from '../../utils';
import { BasicDialogProps } from './types';
import { InferenceTag } from '../../types';
import { useAppTheme } from '../../theme';
import { DialogStyled } from './dialog';
import { booru_url, kaomojis } from '../../constants';
import { Button } from '../common/button';

const TagInfoSection = ({
	icon,
	text,
}: {
	icon: IconSource;
	text: string | number;
	isUser?: boolean;
}) => {
	return (
		<View style={{ flexDirection: 'row' }}>
			<IconButton icon={icon} onPress={() => copyToClipboard(text)} />
			<View style={{ flex: 1, justifyContent: 'center' }}>
				<Text selectable>{text}</Text>
			</View>
		</View>
	);
};

type TagInfoProps = BasicDialogProps & {
	tag: InferenceTag | null;
};
export const TagInfo = ({ tag, visible, onDismiss }: TagInfoProps) => {
	const { colors } = useAppTheme();

	if (!tag) return null;

	return (
		<DialogStyled visible={visible} onDismiss={onDismiss}>
			<Dialog.Title>
				{typeof tag.name === 'string'
					? kaomojis.includes(tag.name)
						? tag.name
						: tag.name.replaceAll('_', ' ')
					: tag.name}
			</Dialog.Title>
			<Dialog.Content>
				<TagInfoSection icon="identifier" text={tag.tag_id} />
				<TagInfoSection
					icon="label-percent-outline"
					text={(tag.probability * 100).toFixed(2) + ' %'}
				/>
				{tag.rank?.rank && (
					<TagInfoSection icon="trophy-outline" text={'Rank: ' + tag.rank?.rank} />
				)}
				{/* <TagInfoSection icon="information" text={} /> */}
				<Button
					androidVariant="default"
					webVariant="contained-tonal"
					onPress={() =>
						openBrowser(`${booru_url}/wiki_pages/${tag.name}`, {
							toolbarColor: colors.surfaceContainer,
							showTitle: true,
						})
					}
				>
					View Wiki
				</Button>
			</Dialog.Content>
			<Dialog.Actions>
				<Button androidVariant="borderless" webVariant="text" onPress={onDismiss}>
					Done
				</Button>
			</Dialog.Actions>
		</DialogStyled>
	);
};
