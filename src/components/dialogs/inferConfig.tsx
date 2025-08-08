import { useEffect, useState } from 'react';
import { ThresholdSettings, useSettingsStore } from '../../store/settings';
import { BasicDialogProps } from './types';
import { DialogStyled } from './dialog';
import { Dialog } from 'react-native-paper';
import { ListSlider } from '../common/slider';
import { Button } from '../common/button';

export const InferenceConfigurator = ({ visible, onDismiss }: BasicDialogProps) => {
	const { char_threshold, general_threshold, updateSettings } = useSettingsStore();
	const [newConfig, setNewConfig] = useState<ThresholdSettings>({
		char_threshold,
		general_threshold,
	});

	const onSave = () => {
		updateSettings(newConfig);
		onDismiss();
	};

	const onClose = () => {
		setNewConfig({ char_threshold, general_threshold });
		onDismiss();
	};

	return (
		<DialogStyled visible={visible} onDismiss={onClose}>
			<Dialog.Title selectable={false}>Configure Inference</Dialog.Title>
			<Dialog.Content>
				<ListSlider
					title={'Character Tag Threshold'}
					description={(newConfig.char_threshold * 100).toFixed(0) + ' %'}
					slider={{
						steps: 0.01,
						min: 0.2,
						max: 1,
						value: newConfig.char_threshold,
						onValueChange(val) {
							setNewConfig((prev) => ({ ...prev, char_threshold: val }));
						},
					}}
				/>
				<ListSlider
					title={'General Tag Threshold'}
					description={(newConfig.general_threshold * 100).toFixed(0) + ' %'}
					slider={{
						steps: 0.01,
						min: 0.2,
						max: 1,
						value: newConfig.general_threshold,
						onValueChange(val) {
							setNewConfig((prev) => ({ ...prev, general_threshold: val }));
						},
					}}
				/>
			</Dialog.Content>
			<Dialog.Actions>
				<Button webVariant="text" androidVariant="borderless" onPress={onClose}>
					Cancel
				</Button>
				<Button webVariant="text" androidVariant="borderless" onPress={onSave}>
					Save
				</Button>
			</Dialog.Actions>
		</DialogStyled>
	);
};
