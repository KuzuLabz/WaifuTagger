import { ActivityIndicator, Surface, Text } from 'react-native-paper';
import { useAppTheme } from '../theme';
import { useLingui } from '@lingui/react/macro';

const LoadingView = () => {
	const theme = useAppTheme();
    const { t } = useLingui();
    
	return (
		<Surface
			style={{
				flex: 1,
				justifyContent: 'center',
				alignItems: 'center',
				gap: 12,
			}}
		>
			<ActivityIndicator size="large" />
			<Text theme={theme} selectable={false}>
				{t`Loading model...`}
			</Text>
		</Surface>
	);
};

export default LoadingView;
