import { StatusBar } from 'expo-status-bar';
import { MD3DarkTheme, PaperProvider } from 'react-native-paper';
import Main from './src';
import { Toaster } from 'burnt/web';

const App = () => {
    return (
        <PaperProvider theme={MD3DarkTheme}>
            <Main />
            <StatusBar style="light" />
            <Toaster position="bottom-right" />
        </PaperProvider>
    );
};

export default App;
