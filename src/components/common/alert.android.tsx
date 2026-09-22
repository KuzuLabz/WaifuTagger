import { Host } from '@expo/ui';
import { AlertDialog, Text, TextButton } from '@expo/ui/jetpack-compose'
import { useAppTheme } from '../../providers/theme';
import { useLingui } from '@lingui/react/macro';

type AlertDialogProps = {
    visible: boolean;
    title: string;
    message?: string;
    dismissLabel?: string;
    confirmLabel: string;
    onConfirm: () => void;
    onDismiss: () => void;
};
export const NativeAlertDialog = ({ visible, title, message, confirmLabel, dismissLabel, onConfirm, onDismiss }: AlertDialogProps) => {
    const { colors } = useAppTheme();
    const { t } = useLingui();

    return( visible &&
        <Host>
            <AlertDialog 
                onDismissRequest={onDismiss} 
                colors={{
                    containerColor: colors.surfaceContainerHigh,
                    iconContentColor: colors.secondary,
                    textContentColor: colors.onSurfaceVariant,
                    titleContentColor: colors.onSurface,
                }}
            >
                <AlertDialog.Title>
                    <Text>{title}</Text>
                </AlertDialog.Title>
                <AlertDialog.Text>
                    <Text>{message}</Text>
                </AlertDialog.Text>
                <AlertDialog.DismissButton>
                    <TextButton colors={{contentColor: colors.primary}} onClick={onDismiss}>
                        <Text>{dismissLabel ?? t`Cancel`}</Text>
                    </TextButton>
                </AlertDialog.DismissButton>
                <AlertDialog.ConfirmButton>
                    <TextButton colors={{contentColor: colors.primary}} onClick={() => {onConfirm(); onDismiss();}}>
                        <Text>{confirmLabel}</Text>
                    </TextButton>
                </AlertDialog.ConfirmButton>
            </AlertDialog>
        </Host>
    );
};