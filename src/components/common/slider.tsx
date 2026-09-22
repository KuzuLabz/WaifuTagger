import { M3eSlider, M3eSliderThumb } from '@m3e/react/slider';
import { Text } from 'react-native-paper';
import { Row } from '@expo/ui';
import { useAppTheme } from '../../providers/theme';
import { M3eListItem } from '@m3e/react/list';

type NativeSliderProps = {
    value: number;
    step?: number;
    min: number;
    max: number;
    showValue?: boolean;
    fractionDigits?: number;
    hosted?: boolean;
    onValueChange: (val: number) => void;
};
export const NativeSlider = ({ value, step, min, max, showValue = true, fractionDigits = 2, onValueChange }: NativeSliderProps) => {
    const { colors } = useAppTheme();
    return (
        <Row spacing={12} alignment='center'>
            <M3eSlider min={min} max={max} step={step} style={{flexGrow: 1}} labelled>
                <M3eSliderThumb value={value} onInputCapture={(e) => onValueChange(e.currentTarget.value)} />
            </M3eSlider>
            {showValue && <Text style={{color: colors.onSurface}}>{value.toFixed(fractionDigits)}</Text>}
        </Row>
    )
};

type ListSliderProps = {title: string} & NativeSliderProps;

export const ListSlider = ({ title, fractionDigits = 2, ...props }: ListSliderProps) => {
    return (
        <M3eListItem>
            {title}
            <span slot="supporting-text">
                <NativeSlider {...props} fractionDigits={fractionDigits} />
            </span>
        </M3eListItem>
    );
};