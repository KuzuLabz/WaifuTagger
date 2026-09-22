import { Column, Host, Row, Text } from '@expo/ui';
import { Slider as AndroidSlider } from '@expo/ui/jetpack-compose';
import { Slider as IosSlider } from '@expo/ui/swift-ui';
import { Platform } from 'react-native';
import { useAppTheme } from '../../providers/theme';
import { fillMaxWidth, weight } from '@expo/ui/jetpack-compose/modifiers';
import { ReactNode } from 'react';

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

    const Parent = ({children}: {children: ReactNode}) =>  
                hosted 
                ? <Host matchContents>{children}</Host>
                : <>{children}</>;

    if (Platform.OS === 'ios') {
        return 
    }
    
    return(
        <Parent>
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

    const Parent = ({children}: {children: ReactNode}) =>  
                hosted 
                ? <Host matchContents={{vertical: true}}>{children}</Host>
                : <>{children}</>;

    return(
        <Parent>
            <Column spacing={6}> 
                <Text textStyle={{color: colors.onSurface}} style={{paddingTop: 12}}>{title}</Text>
                <NativeSlider {...props} fractionDigits={fractionDigits} />
            </Column>
        </Parent>
    );
};