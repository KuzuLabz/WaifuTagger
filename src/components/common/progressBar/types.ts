import { UniversalHostProps } from "@expo/ui";

export type ProgressBarProps = UniversalHostProps & { 
    value: number; 
    max?: number; 
    /** Android only */
    variant?: 'linear' | 'wavy'; 
    indeterminate?: boolean; 
    hosted?: boolean;
    /** Web only */
    slot?: 'leading' | 'trailing';
};
