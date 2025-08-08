import { Platform, View, ViewStyle } from 'react-native';
import { Divider, ProgressBar, Text, useTheme } from 'react-native-paper';
import { InferenceTag } from '../types';

const Result = ({ name, probability, rank }: InferenceTag) => {
	const { colors } = useTheme();
	return (
		<View
			style={[
				Platform.select<ViewStyle>({
					web: { marginVertical: 12 },
					native: { marginVertical: 10 },
				}),
			]}
		>
			{Platform.OS === 'web' ? (
				<View style={{ height: 6 }}>
					<ProgressBar progress={probability} style={[{ borderRadius: 12 }]} />
				</View>
			) : (
				<ProgressBar progress={probability} style={[{ borderRadius: 12 }]} />
			)}
			<View
				style={{
					flexDirection: 'row',
					justifyContent: 'space-between',
					alignItems: 'center',
				}}
			>
				<Text variant="titleMedium">{name}</Text>
				<View style={{ flex: 1, justifyContent: 'center', marginHorizontal: 10 }}>
					<Divider style={{ backgroundColor: colors.primary }} />
				</View>
				<Text>{(probability * 100).toFixed(0)}%</Text>
			</View>
		</View>
	);
};

export default Result;
