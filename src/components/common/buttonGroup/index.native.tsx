import { SegmentedButtons } from 'react-native-paper';
import { ButtonGroupProps } from './types';
import { getPaperIcon } from '../icon/getPaperIcon';

export const ButtonGroup = ({ selectedIndex, actions, onValueChange }: ButtonGroupProps) => {
    return(
        <SegmentedButtons 
            value={actions[selectedIndex].label}
            buttons={actions.map((v) => ({value: v.label, label: v.label, icon: v.icon && getPaperIcon(v.icon)}))} 
            onValueChange={(val: string) => {
                onValueChange(actions.findIndex((v) => v.label === val));
            }}
            density='small'
        />
    );
};