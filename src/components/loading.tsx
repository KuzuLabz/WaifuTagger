import { Text } from 'react-native-paper';
import { useLingui } from '@lingui/react/macro';
import { useAppTheme } from '../providers/theme';
import { Platform, View } from 'react-native';
import { CircularProgress } from './common/progressBar';
import { useModelsStore } from '../store/models';
import { MODEL_CATALOG } from '../constants';

const LoadingView = () => {
    const { colors } = useAppTheme();
    const selected = useModelsStore(state => state.selected);
    const { t } = useLingui();

    if (!selected) {
        return null;
    }
    
	return (
		<View
			style={{
				flex: 1,
				justifyContent: 'center',
				alignItems: 'center',
				gap: 12,
                backgroundColor: colors.surface
			}}
		>
			<CircularProgress hosted={Platform.OS !== 'web'} value={0} indeterminate matchContents />
            <Text>{t`Loading ${MODEL_CATALOG[selected.type].name}`}</Text>
		</View>
	);
};

export default LoadingView;
