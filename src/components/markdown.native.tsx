import { Markdown as MarkdownNative } from 'react-native-nitro-markdown';
import { useAppTheme } from '../providers/theme';

export const Markdown = ({children}: {children: string}) => {
    const { colors } = useAppTheme();
    return(
        <MarkdownNative options={{gfm: true}} theme={{ colors: {text: colors.onSurface, heading: colors.onSurface, accent: colors.primary}}}>
            {children}
        </MarkdownNative>
    );
};