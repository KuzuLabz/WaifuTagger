import * as Burnt from 'burnt';
import { ToastOptions } from 'burnt/build/types';

type SendToastProps = {
    title: string;
    preset?: ToastOptions['preset'];
    duration?: number;
};
export const sendToast = (config: SendToastProps) => {
    // @ts-expect-error
    Burnt.toast({ shouldDismissByDrag: true, from: 'bottom', ...config});
};