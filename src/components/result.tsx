import { View } from 'react-native';
import { Divider, ProgressBar, Text, useTheme } from 'react-native-paper';

type ResultProps = {
	name: string | number;
	probability: number;
};
const Result = ({ name, probability }: ResultProps) => {
	const { colors } = useTheme();
	return (
		<View style={{ marginVertical: 10 }}>
			<ProgressBar progress={probability} style={{ borderRadius: 12 }} />
			<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
				<Text>{name ?? 'Test'}</Text>
				<View style={{ flex: 1, justifyContent: 'center', marginHorizontal: 10 }}>
					{/* <View
                        style={{
                            borderWidth: 1,
                            height: 0,
                            borderColor: 'red',
                            borderStyle: 'dotted',
                            borderRadius: 12,
                        }}
                    /> */}
					<Divider style={{ backgroundColor: colors.primary }} />
				</View>
				<Text>{(probability * 100).toFixed(0)}%</Text>
			</View>
		</View>
	);
};

export default Result;
