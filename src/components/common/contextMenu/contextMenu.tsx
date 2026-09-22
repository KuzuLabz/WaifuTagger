import { M3eMenu, M3eMenuElement, M3eMenuItem } from '@m3e/react/menu';
import React, { ReactElement, ReactNode, Ref, useImperativeHandle, useRef, useState } from 'react';
import { ContextMenuAction, ContextMenuTriggerProps } from './types';
import { Menu } from 'react-native-paper';
import { useAppTheme } from '../../../providers/theme';
import { Platform } from 'react-native';

export const ContextMenuItem = ({title, icon, onPress}: { title: string; icon?: ReactNode, onPress: () => void}) => {
    return(
        <M3eMenuItem onClick={onPress}>
            {title}
            {icon}
        </M3eMenuItem>
    )
};

export const MaterialContextMenu = ({ id, ref, children }: { id?: string; ref?: Ref<M3eMenuElement>; children: ReactNode}) => {
    return(
        <M3eMenu 
            id={id} 
            ref={ref} 
            variant='vibrant' 
            positionY='below'
        >
            {children}
        </M3eMenu>
    );
};

export interface ContextMenuRef {
    handleContextMenu: (event: any) => void;
}

interface ContextMenuProps {
    ref: Ref<ContextMenuRef>;
    children: ReactNode;
}

export const ContextMenu = ({ children, ref }: ContextMenuProps) => {
    const menuRef = useRef<M3eMenuElement>(null);
    const anchorRef = useRef<HTMLDivElement>(null);
    
    useImperativeHandle(ref, () => ({
        handleContextMenu: (event: any) => {
            event?.preventDefault?.();

            const menu = menuRef.current;
            const anchor = anchorRef.current;
            if (!menu || !anchor) return;

            const clientX = event.nativeEvent?.clientX ?? event.clientX ?? 0;
            const clientY = event.nativeEvent?.clientY ?? event.clientY ?? 0;

            anchor.style.left = `${clientX}px`;
            anchor.style.top = `${clientY}px`;

            if (typeof menu.show === "function") {
                menu.show(anchor);
            }
        },
    }));

    return (
        <>
            <div
                ref={anchorRef}
                style={{ position: "fixed", width: 0, height: 0, pointerEvents: "none" }}
            />
            <MaterialContextMenu ref={menuRef}>{children}</MaterialContextMenu>
        </>
    );
};

export function ContextMenuTrigger<const T extends readonly ContextMenuAction[]>({ 
    children, 
    actions,
    platforms,
    onItemPress
}: ContextMenuTriggerProps<T>): ReactElement | null {
    const { colors } = useAppTheme();
    const [vis, setVis] = useState(false);
    const [anchor, setAnchor] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        
        // Capture mouse coordinates
        const x = e.clientX;
        const y = e.clientY;

        setAnchor({ x, y });
        setVis(true);
    };

    const handleItemPress = (id: T[number]["id"]) => {
        setVis(false);
        onItemPress(id);
    };

    if (platforms && (!platforms.includes(Platform.OS))) {
        return children
    }

    return (
        <div onContextMenu={handleContextMenu} style={{ display: "contents" }}>
            {children}
            <Menu 
                visible={vis}
                onDismiss={() => setVis(false)}
                anchor={anchor}
                // style={{backgroundColor: colors.tertiaryContainer}}
                contentStyle={{backgroundColor: colors.tertiaryContainer, borderRadius: 16, overflow: 'hidden'}}
            >
                {actions.map((action) => 
                    <Menu.Item 
                        key={action.id} 
                        title={action.title} 
                        onPress={() => handleItemPress(action.id)} 
                        titleStyle={{color: colors.onTertiaryContainer}}
                        // rippleColor={Color(colors.onTertiaryContainer).opaquer(.6).hex()}
                    />
                )}
            </Menu>
        </div>
    );
};