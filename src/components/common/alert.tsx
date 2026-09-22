import { Button, Dialog, Text } from 'react-native-paper'

type NativeAlertDialogProps = {
    visible: boolean;
    title: string;
    message?: string;
    cancelLabel?: string;
    confirmLabel?: string;
    onConfirm: () => void;
    onDismiss: () => void;
};
export const NativeAlertDialog = ({ visible, title, message, confirmLabel, cancelLabel, onConfirm, onDismiss }: NativeAlertDialogProps) => {

    return (
        <Dialog visible={visible}>
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Content>
                <Text>{message}</Text>
            </Dialog.Content>
            <Dialog.Actions>
                <Button onPress={onDismiss}>{cancelLabel}</Button>
                <Button onPress={onConfirm}>{confirmLabel}</Button>
            </Dialog.Actions>
        </Dialog>
    );
};