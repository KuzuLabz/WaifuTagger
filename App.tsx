import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { MD3DarkTheme, PaperProvider } from 'react-native-paper';
import Main from './src';

const App = () => {
    return (
        <PaperProvider theme={MD3DarkTheme}>
            <Main />
            <StatusBar style="auto" />
        </PaperProvider>
    );
};

export default App;
