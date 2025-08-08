import { StatusBar } from 'expo-status-bar';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import { Toaster } from 'burnt/web';
import { Platform } from 'react-native';
import { useMaterial3Theme } from '@pchmn/expo-material3-theme';
import React, { useMemo } from 'react';
import { useSettingsStore } from './src/store/settings';
import Main from './src';

const App = () => {
	const { darkMode } = useSettingsStore();
	const { theme, updateTheme } = useMaterial3Theme({ fallbackSourceColor: '#3E8260' });

	const paperTheme = useMemo(
		() =>
			darkMode
				? { ...MD3DarkTheme, colors: { ...MD3DarkTheme.colors, ...theme.dark } }
				: { ...MD3LightTheme, colors: { ...MD3LightTheme.colors, ...theme.light } },
		[darkMode, theme],
	);

	return (
		<PaperProvider theme={paperTheme}>
			<React.Fragment>
				{Platform.OS === 'web' ? (
					<style type="text/css">{`
					@font-face {
					font-family: 'MaterialDesignIcons';
					src: url(${require('./assets/fonts/MaterialDesignIcons.ttf')}) format('truetype');
					}
				`}</style>
				) : null}
			</React.Fragment>
			<Main updateTheme={updateTheme} />
			<StatusBar style={darkMode ? 'light' : 'dark'} translucent />
			<Toaster position="bottom-right" />
		</PaperProvider>
	);
};

export default App;
