import MarkdownPreview from '@uiw/react-markdown-preview';
import { useAppTheme } from '../providers/theme';

export const Markdown = ({children}: {children: string}) => {
    const { dark } = useAppTheme();
    
    const colorScheme = dark ? 'dark' : 'light';
    
    return(
        <MarkdownPreview source={children} style={{backgroundColor: 'transparent'}} wrapperElement={{"data-color-mode": colorScheme}} />
    );
};