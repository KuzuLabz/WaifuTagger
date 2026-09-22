import { BottomSheetProps, BottomSheet as NativeSheet } from '@expo/ui';

export const BottomSheet = (props: BottomSheetProps) => {
    return(
        <NativeSheet {...props} />
    )
};