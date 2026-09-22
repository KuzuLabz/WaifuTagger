import { M3eButtonGroup } from '@m3e/react/button-group';
import { M3eButton } from '@m3e/react/button';
import { ButtonGroupProps } from './types';
import { Icon } from '../icon';

export const ButtonGroup = ({ selectedIndex, actions, style = {}, onValueChange }: ButtonGroupProps) => {
    return(
        //@ts-expect-error
        <M3eButtonGroup variant="connected" style={{'--md-sys-density-scale': '-2', ...style}}>
            {actions.map(({label, icon}, idx) => 
                <M3eButton 
                    key={idx} 
                    selected={idx === selectedIndex} 
                    toggle 
                    onClick={() => onValueChange(idx)} 
                    variant="tonal"
                >
                    {icon && <Icon name='database' slot='icon' />}
                    {label}
                </M3eButton>
            )}
        </M3eButtonGroup>
    );
};