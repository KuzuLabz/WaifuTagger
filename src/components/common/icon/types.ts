import { UniversalBaseProps } from "@expo/ui";

export type IconProps = {
    name: 'autorenew' | 'update' | 'info' | 'account' | 'database' | 'folder-managed' | 'folder-open' | 'content-copy' | 'launch' | 'license';
    size?: number;
    color?: string;
    
    /** Mobile only */
    modifiers?: UniversalBaseProps['modifiers'];
    
    /** Web only */
    slot?: 'trailing' | 'leading' | 'icon';
};