import { Platform, StyleSheet, View } from 'react-native';
import { useStatsStore } from '../store/stats';
import { ProgressBar, Text } from 'react-native-paper';

export const LevelView = ({ isLoading }: { isLoading: boolean }) => {
	const { isEnabled, levelInfo } = useStatsStore();

	const style = StyleSheet.create({
		text: {
			color: '#FFF',
			fontWeight: '900',
			textShadowRadius: 10,
			textShadowOffset: { height: 2, width: 2 },
			textShadowColor: '#000',
		},
	});

	if (!isEnabled) {
		return null;
	}

	return (
		<View style={{ overflow: 'hidden' }}>
			<ProgressBar
				progress={levelInfo.xp / levelInfo.levelXpCap}
				indeterminate={isLoading}
				style={{ width: '100%', borderRadius: 0, height: Platform.OS === 'web' ? 12 : 18 }}
			/>
			<View
				style={{
					position: 'absolute',
					height: '100%',
					width: '100%',
					justifyContent: 'center',
					alignItems: 'center',
					overflow: 'visible',
				}}
			>
				<View
					style={{
						position: 'absolute',
						left: 0,
						height: '100%',
						justifyContent: 'center',
						paddingHorizontal: 6,
					}}
				>
					<Text selectable={false} style={[style.text]}>
						Lvl. {levelInfo.level}
					</Text>
				</View>
				<Text selectable={false} style={[style.text]}>
					{levelInfo.xp} / {levelInfo.levelXpCap}
				</Text>
			</View>
		</View>
	);
};
