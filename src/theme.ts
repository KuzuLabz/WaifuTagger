import { Material3Scheme } from '@pchmn/expo-material3-theme';
import { MD3Theme, useTheme } from 'react-native-paper';

export const useAppTheme = useTheme<MD3Theme & { colors: Material3Scheme }>;
