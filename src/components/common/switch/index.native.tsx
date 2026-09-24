import { Host } from '@expo/ui';
import { Row, Switch, Text } from '@expo/ui/jetpack-compose';
import { Toggle } from '@expo/ui/swift-ui';

import { useAppTheme } from '../../../providers/theme';
import { Platform } from 'react-native';
import { weight } from '@expo/ui/jetpack-compose/modifiers';
import { ListItem } from '../list';
import { ListSwitchProps, NativeSwitchProps } from './types';
import { ReactNode } from 'react';

const Parent = ({children, isHosted}: {isHosted?: boolean; children: ReactNode}) =>  
            isHosted 
            ? <Host matchContents>{children}</Host>
            : <>{children}</>;

export const NativeSwitch = ({ label, value, hosted, onValueChange}:NativeSwitchProps) => {
    const { colors } = useAppTheme();

    if (Platform.OS === 'ios') {
        return(
            <Parent>
                <Toggle label={label} isOn={value} onIsOnChange={onValueChange} />
            </Parent>
        );
    }

    return(
        <Parent isHosted={hosted}>
            <Row verticalAlignment="center" horizontalArrangement={{ spacedBy: 8 }}>
                {label && <Text modifiers={[weight(1)]}>{label}</Text>}
                <Switch 
                    value={value} 
                    onCheckedChange={onValueChange} 
                    colors={{
                        checkedTrackColor: colors.primary,
                        checkedThumbColor: colors.onPrimary,
                        uncheckedTrackColor: colors.surfaceContainerHighest,
                        uncheckedThumbColor: colors.outline,
                        uncheckedBorderColor: colors.outline
                    }} 
                />
            </Row>
        </Parent>
    );
};

export const ListSwitch = ({title, value, isFirst, isLast, onValueChange}: ListSwitchProps) => {
    
    return(
        <ListItem
            title={title}
            isFirst={isFirst}
            isLast={isLast}
            // trailing={<NativeSwitch value={value} onValueChange={(val) => onValueChange(val)} hosted />}
            trailing={
                    <NativeSwitch value={value} onValueChange={onValueChange} hosted />
            }
        />
    );
};