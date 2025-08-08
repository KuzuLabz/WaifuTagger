import { Platform, ScrollView, View } from 'react-native';
import { AndroidImageColors, WebImageColors } from 'react-native-image-colors/build/types';
import { SettingsState, useSettingsStore } from '../../store/settings';
import { Chip, Dialog, Divider, List } from 'react-native-paper';
import { BasicDialogProps } from './types';
import { DialogStyled } from './dialog';
import { Button } from '../common/button';
import { ListItemSwitch } from '../common/switch';
import { WindowSetDarkTheme, WindowSetLightTheme } from '../../wailsjs/runtime/runtime';
import { useStatsStore } from '../../store/stats';

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
const webColorModes: (keyof WebImageColors)[] = [
	'vibrant',
	'dominant',
	'darkMuted',
	'darkVibrant',
	'lightMuted',
	'lightVibrant',
	'muted',
];

const colorModes = Platform.select({
	android: androidColorModes,
	web: webColorModes,
});

type ThemeModeSelectionProps = {
	colorMode: SettingsState['colorMode'];
	updateSettings: (config: Partial<SettingsState>) => void;
	updateTheme: (mode: SettingsState['colorMode']) => void;
};
const ThemeModeSelection = ({
	colorMode,
	updateTheme,
	updateSettings,
}: ThemeModeSelectionProps) => {
	return (
		<>
			{colorModes.map((mode, idx) => (
				<Chip
					key={idx}
					selected={mode === colorMode}
					onPress={() => {
						updateSettings({ colorMode: mode });
						updateTheme(mode);
					}}
					style={{ margin: 5 }}
					textStyle={{ textTransform: 'capitalize' }}
				>
					{mode}
				</Chip>
			))}
		</>
	);
};

export const AppSettings = ({
	visible,
	onDismiss,
	updateTheme,
}: BasicDialogProps & { updateTheme: (mode: keyof AndroidImageColors) => void }) => {
	const { colorMode, darkMode, autoInfer, updateSettings } = useSettingsStore();
	const { isEnabled: isRankEnabled, setIsEnabled: setIsRankEnabled } = useStatsStore();

	return (
		<DialogStyled visible={visible} onDismiss={onDismiss}>
			<Dialog.Title selectable={false}>Settings</Dialog.Title>
			<Dialog.Content>
				<ListItemSwitch
					title={'Auto Inference'}
					value={autoInfer}
					onValueChange={(val) => updateSettings({ autoInfer: val })}
				/>
				<ListItemSwitch
					title={'Rank Mode'}
					value={isRankEnabled}
					onValueChange={(val) => setIsRankEnabled(val)}
				/>
				<Divider />
				<ListItemSwitch
					title={'Dark mode'}
					value={darkMode}
					onValueChange={(val) => {
						updateSettings({ darkMode: val });
						if (Platform.OS === 'web') {
							if (val) {
								WindowSetDarkTheme();
							} else {
								WindowSetLightTheme();
							}
						}
					}}
				/>
				<List.Item
					title={'Dynamic Theme Mode'}
					description={'Theme color is based on selected image color mode'}
				/>
				{Platform.OS === 'web' ? (
					<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
						<ThemeModeSelection
							colorMode={colorMode}
							updateSettings={updateSettings}
							updateTheme={updateTheme}
						/>
					</View>
				) : (
					<ScrollView showsHorizontalScrollIndicator={false} horizontal>
						<ThemeModeSelection
							colorMode={colorMode}
							updateSettings={updateSettings}
							updateTheme={updateTheme}
						/>
					</ScrollView>
				)}
			</Dialog.Content>
			<Dialog.Actions>
				<Button androidVariant="borderless" webVariant="text" onPress={onDismiss}>
					Close
				</Button>
			</Dialog.Actions>
		</DialogStyled>
	);
};
