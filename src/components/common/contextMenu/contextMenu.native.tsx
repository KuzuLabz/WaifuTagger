import { MenuView } from '@expo/ui/community/menu';
import { useAppTheme } from '../../../providers/theme';
import { ContextMenuAction, ContextMenuTriggerProps } from './types';
import { Platform } from 'react-native';
import { ReactElement } from 'react';

export function ContextMenuTrigger<const T extends readonly ContextMenuAction[]>({
    actions,
    onItemPress,
    platforms,
    children,
}: ContextMenuTriggerProps<T>): ReactElement | null {
    const { dark } = useAppTheme();

    if (platforms && (!platforms.includes(Platform.OS))) {
        return children
    }

    return (
        <MenuView
            //@ts-expect-error action->image accepts string for web compat
            actions={actions}
            onPressAction={({ nativeEvent: { event } }) => {
                onItemPress(event as T[number]['id']);
            }}
            colorScheme={dark ? 'dark' : 'light'}
            style={{ borderRadius: 12 }}
        >
            {children}
        </MenuView>
    );
}