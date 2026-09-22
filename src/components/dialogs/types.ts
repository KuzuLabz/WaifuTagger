import { ReactNode } from "react";
import { ButtonProps, DialogProps as PaperDialogProps } from "react-native-paper";

export type DialogProps = Omit<PaperDialogProps, 'onDismiss'> & { 
    title: string; 
    actions: {
        title: string; 
        onPress?: () => void;
        autoDismiss?: boolean;
    }[]; 
    onDismiss?: () => void;
    scrollable?: boolean;
};

export type SideSheetProps = {
    isPresented: boolean;
    title: string;
    children: ReactNode;
    scrollable?: boolean;
    actions?: {title: string; disabled?: boolean; onPress: () => void, mode?: ButtonProps['mode']}[];
    actionHeader?: ReactNode;
    onDismiss: () => void; 
};