import { Column, Host, Row, Text } from '@expo/ui';
import { Slider as AndroidSlider } from '@expo/ui/jetpack-compose';
import { Slider as IosSlider } from '@expo/ui/swift-ui';
import { Platform } from 'react-native';
import { useAppTheme } from '../../providers/theme';
import { fillMaxWidth, weight } from '@expo/ui/jetpack-compose/modifiers';
import { ReactNode } from 'react';

const Parent = ({children, isHosted}: {isHosted?: boolean; children: ReactNode}) =>  
    isHosted 
    ? <Host matchContents>{children}</Host>
    : <>{children}</>;

type NativeSliderProps = {
    value: number;
    step: number;
    min: number;
    max: number;
    showValue?: boolean;
    fractionDigits?: number;
    hosted?: boolean;
    onValueChange: (val: number) => void;
};
export const NativeSlider = ({ value, max, min, step, fractionDigits = 2, showValue = true, hosted, onValueChange }: NativeSliderProps) => {
    const { colors } = useAppTheme();

    if (Platform.OS === 'ios') {
        return 
    }
    
    return(
        <Parent isHosted={hosted}>
            <Row spacing={12} alignment='center'>
                {Platform.select({
                    android: 
                        <AndroidSlider 
                            value={value} 
                            onValueChange={onValueChange} 
                            min={min} 
                            max={max}
                            steps={step}
                            colors={{
                                thumbColor: colors.primary,
                                activeTickColor: colors.onPrimary,
                                activeTrackColor: colors.onSecondaryContainer,
                                inactiveTickColor: colors.primary,
                                inactiveTrackColor: colors.secondaryContainer
                            }}
                            modifiers={[ weight(0.9)]}
                        />,
                    ios: 
                        <IosSlider value={value} min={min} max={max} step={step} onValueChange={onValueChange} />,
            })}
                {showValue && <Text textStyle={{color: colors.onSurface}}>{value.toFixed(fractionDigits)}</Text>}
            </Row>
        </Parent>
    );
};

export const ListSlider = ({ title, fractionDigits = 2, hosted, ...props }: NativeSliderProps & { title: string }) => {
    const { colors } = useAppTheme();

    return(
        <Parent isHosted={hosted}>
            <Column spacing={6}> 
                <Text textStyle={{color: colors.onSurface}} style={{paddingTop: 12}}>{title}</Text>
                <NativeSlider {...props} fractionDigits={fractionDigits} />
            </Column>
        </Parent>
    );
};