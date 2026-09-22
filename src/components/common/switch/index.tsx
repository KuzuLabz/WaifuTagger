import { M3eSwitch } from '@m3e/react/switch';
import { M3eListAction } from "@m3e/react/list";
import { ListSwitchProps, NativeSwitchProps } from "./types";

export const NativeSwitch = ({value, slot, onValueChange}:NativeSwitchProps) => {
    return(
        <M3eSwitch checked={value} slot={slot} onClick={() => onValueChange(!value)} />
    );
};

export const ListSwitch = ({title, value, onValueChange}: ListSwitchProps) => {
    return(
        <M3eListAction onClick={() => onValueChange(!value)}>
            {title}
            <NativeSwitch slot="trailing" value={value} onValueChange={onValueChange} />
        </M3eListAction>
    );
};