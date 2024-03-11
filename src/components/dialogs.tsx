import {
	ActivityIndicator,
	Button,
	Dialog,
	Divider,
	IconButton,
	List,
	Text,
	useTheme,
} from 'react-native-paper';
import { InferenceTag } from '../types';
import { Linking, View } from 'react-native';
import { IconSource } from 'react-native-paper/lib/typescript/components/Icon';
import { useEffect, useState } from 'react';
import Slider from '@react-native-community/slider';
import { InferenceConfig } from '../storage';
import { kaomojis } from '../constants';
import Constants from 'expo-constants';
import { copyToClipboard } from '../utils';

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
			</Dialog.Content>
			<Dialog.Actions>
				<Button onPress={onDismiss}>Done</Button>
			</Dialog.Actions>
		</Dialog>
	);
};

type InferenceConfiguratorProps = BasicDialogProps & {
	onChange: (config: InferenceConfig) => void;
	defaultConfig: InferenceConfig;
};
export const InferenceConfigurator = ({
	visible,
	onDismiss,
	defaultConfig,
	onChange,
}: InferenceConfiguratorProps) => {
	const { colors } = useTheme();
	const [newConfig, setNewConfig] = useState<InferenceConfig>(defaultConfig);

	const onSave = () => {
		onChange(newConfig);
		onDismiss();
	};

	return (
		<Dialog visible={visible} onDismiss={onDismiss}>
			<Dialog.Title>Inference Settings</Dialog.Title>
			<Dialog.Content>
				<List.Item
					title={'Character Tag Threshold'}
					description={newConfig.character_threshold.toFixed(2)}
				/>
				<Slider
					step={0.05}
					minimumValue={0.05}
					maximumValue={1}
					thumbTintColor={colors.primary}
					minimumTrackTintColor={colors.primaryContainer}
					value={newConfig.character_threshold}
					onValueChange={(val) =>
						setNewConfig((prev) => ({ ...prev, character_threshold: val }))
					}
				/>
				<List.Item
					title={'General Tag Threshold'}
					description={newConfig.general_threshold.toFixed(2)}
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
			<Dialog.Title>{Constants.expoConfig?.name}</Dialog.Title>
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
					<Text style={{ fontWeight: '900' }}>
						This model only accepts PNG and JPEG images.
					</Text>
				</View>
			</Dialog.Content>
			<Dialog.Actions>
				<Button onPress={onDismiss}>Close</Button>
			</Dialog.Actions>
		</Dialog>
	);
};
