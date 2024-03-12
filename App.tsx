import 'react-native-image-keyboard';
import { StatusBar } from 'expo-status-bar';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import Main from './src';
import { Toaster } from 'burnt/web';
import { useColorScheme } from 'react-native';
import { useMaterial3Theme } from '@pchmn/expo-material3-theme';
import { useEffect, useMemo } from 'react';

const App = () => {
	const colorScheme = useColorScheme();
	// If the device is not compatible, it will return a theme based on the fallback source color (optional, default to #6750A4)
	const { theme, updateTheme } = useMaterial3Theme({ fallbackSourceColor: '#3E8260' });

	const paperTheme = useMemo(
		() =>
			colorScheme === 'dark'
				? { ...MD3DarkTheme, colors: theme.dark }
				: { ...MD3LightTheme, colors: theme.light },
		[colorScheme, theme],
	);

	return (
		<PaperProvider theme={paperTheme}>
			<Main updateTheme={updateTheme} />
			<StatusBar style="light" />
			<Toaster position="bottom-right" />
		</PaperProvider>
	);
};

export default App;
