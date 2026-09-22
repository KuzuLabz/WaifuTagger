export type NativeSwitchProps = {
    label?: string; 
    value: boolean; 
    onValueChange?: (val: boolean) => void;
    slot?: string;
    hosted?: boolean;
};

export type ListSwitchProps = {
    title: string; 
    value: boolean; 
    isFirst?: boolean;
    isLast?: boolean;
    hosted?: boolean;
    onValueChange?: (val: boolean) => void
};