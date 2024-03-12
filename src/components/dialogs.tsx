import {
	ActivityIndicator,
	Button,
	Chip,
	Dialog,
	Divider,
	IconButton,
	List,
	Menu,
	Text,
	useTheme,
} from 'react-native-paper';
import { InferenceTag } from '../types';
import { Linking, ScrollView, View } from 'react-native';
import { IconSource } from 'react-native-paper/lib/typescript/components/Icon';
import { useEffect, useState } from 'react';
import Slider from '@react-native-community/slider';
import { kaomojis } from '../constants';
import { copyToClipboard, openBrowser } from '../utils';
import { SettingsState, ThresholdSettings, useSettingsStore } from '../store';
import { useAppTheme } from '../theme';
import { AndroidImageColors } from 'react-native-image-colors/build/types';

type BasicDialogProps = {
	visible: boolean;
	onDismiss: () => void;
};

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
	const [loading, setLoading] = useState(false);

	if (!tag) return null;

	return (
		<Dialog visible={visible} onDismiss={onDismiss}>
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
				{/* <TagInfoSection icon="information" text={} /> */}
				<Button
					mode="contained-tonal"
					onPress={() =>
						openBrowser(`https://danbooru.donmai.us/wiki_pages/${tag.name}`, {
							toolbarColor: colors.surfaceContainer,
							showTitle: true,
						})
					}
				>
					View Wiki
				</Button>
			</Dialog.Content>
			<Dialog.Actions>
				<Button onPress={onDismiss}>Done</Button>
			</Dialog.Actions>
		</Dialog>
	);
};

export const InferenceConfigurator = ({ visible, onDismiss }: BasicDialogProps) => {
	const { colors } = useTheme();
	const { char_threshold, general_threshold, updateThresholds } = useSettingsStore();
	const [newConfig, setNewConfig] = useState<ThresholdSettings>({
		char_threshold,
		general_threshold,
	});

	const onSave = () => {
		updateThresholds(newConfig);
		onDismiss();
	};

	useEffect(() => {
		if (visible) {
			setNewConfig({ char_threshold, general_threshold });
		}
	}, [visible]);

	return (
		<Dialog visible={visible} onDismiss={onDismiss}>
			<Dialog.Title>Configure Inference</Dialog.Title>
			<Dialog.Content>
				<List.Item
					title={'Character Tag Threshold'}
					description={(newConfig.char_threshold * 100).toFixed(0) + ' %'}
				/>
				<Slider
					step={0.05}
					minimumValue={0.05}
					maximumValue={1}
					thumbTintColor={colors.primary}
					minimumTrackTintColor={colors.primaryContainer}
					value={newConfig.char_threshold}
					onValueChange={(val) =>
						setNewConfig((prev) => ({ ...prev, char_threshold: val }))
					}
				/>
				<List.Item
					title={'General Tag Threshold'}
					description={(newConfig.general_threshold * 100).toFixed(0) + ' %'}
				/>
				<Slider
					step={0.05}
					minimumValue={0.05}
					maximumValue={1}
					thumbTintColor={colors.primary}
					minimumTrackTintColor={colors.primaryContainer}
					value={newConfig.general_threshold}
					onValueChange={(val) =>
						setNewConfig((prev) => ({ ...prev, general_threshold: val }))
					}
				/>
			</Dialog.Content>
			<Dialog.Actions>
				<Button onPress={onDismiss}>Cancel</Button>
				<Button onPress={onSave}>Save</Button>
			</Dialog.Actions>
		</Dialog>
	);
};

export const AppInfo = ({ visible, onDismiss }: BasicDialogProps) => {
	const { colors } = useTheme();
	return (
		<Dialog visible={visible} onDismiss={onDismiss}>
			<Dialog.Title>About</Dialog.Title>
			<Dialog.Content>
				<View>
					<Text>
						This app uses an optimized version of SmilingWolfs{' '}
						<Text
							style={{ color: colors.primary, textDecorationLine: 'underline' }}
							onPress={() =>
								Linking.openURL(
									'https://huggingface.co/SmilingWolf/wd-convnext-tagger-v3',
								)
							}
						>
							wd-convnext-tagger-v3
						</Text>{' '}
						model.
					</Text>
					<Text>
						{'\n'}If you would like to know more about the optimized model, check out
						the model card{' '}
						<Text
							style={{ color: colors.primary, textDecorationLine: 'underline' }}
							onPress={() =>
								Linking.openURL(
									'https://huggingface.co/Smashinfries/wd-convnext-tagger-v3-mobile',
								)
							}
						>
							here
						</Text>
						{'!'}
					</Text>
					<Divider style={{ marginVertical: 20 }} />
					<Text style={{ fontWeight: '900' }}>Only PNG and JPEG images can be used.</Text>
				</View>
			</Dialog.Content>
			<Dialog.Actions>
				<Button onPress={onDismiss}>Close</Button>
			</Dialog.Actions>
		</Dialog>
	);
};

const androidColorModes: (keyof AndroidImageColors)[] = [
	'average',
	'dominant',
	'vibrant',
	'darkVibrant',
	'lightVibrant',
	'darkMuted',
	'lightMuted',
	'muted',
];
export const AppSettings = ({
	visible,
	onDismiss,
	updateTheme,
}: BasicDialogProps & { updateTheme: (mode: keyof AndroidImageColors) => void }) => {
	const { colorMode, updateColorMode } = useSettingsStore();

	return (
		<Dialog visible={visible} onDismiss={onDismiss}>
			<Dialog.Title>Settings</Dialog.Title>
			<Dialog.Content>
				<List.Item
					title={'Dynamic Theme Mode'}
					description={'Theme color is based on selected image color mode'}
				/>
				<ScrollView horizontal showsHorizontalScrollIndicator={false}>
					{androidColorModes.map((mode, idx) => (
						<Chip
							key={idx}
							selected={mode === colorMode}
							onPress={() => {
								updateColorMode(mode);
								updateTheme(mode);
							}}
							style={{ margin: 5 }}
						>
							{mode}
						</Chip>
					))}
				</ScrollView>
			</Dialog.Content>
			<Dialog.Actions>
				<Button onPress={onDismiss}>Close</Button>
			</Dialog.Actions>
		</Dialog>
	);
};
