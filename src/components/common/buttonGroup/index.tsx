import { M3eButtonGroup } from '@m3e/react/button-group';
import { M3eButton } from '@m3e/react/button';
import { ButtonGroupProps } from './types';
import { Icon } from '../icon';

export const ButtonGroup = ({ selectedIndex, actions, style = {}, onValueChange }: ButtonGroupProps) => {
    // m3e-button writes an inline `--_button-shape` on its shadow `.base`
    // (sometimes even 0px, after measuring itself before layout), and that
    // shadows every radius token. The corner-specific properties below win
    // over that fallback, so pin all four corners explicitly.
    const groupStyle = {
        '--_button-rounded-start-shape': 'var(--md-sys-shape-corner-full, 9999px)',
        '--_button-rounded-end-shape': 'var(--md-sys-shape-corner-full, 9999px)',
        '--_button-start-shape-pressed-morph': 'var(--md-sys-shape-corner-full, 9999px)',
        '--_button-end-shape-pressed-morph': 'var(--md-sys-shape-corner-full, 9999px)',
        '--m3e-connected-button-group-small-inner-shape': 'var(--md-sys-shape-corner-full, 9999px)',
        '--m3e-connected-button-group-small-inner-pressed-shape': 'var(--md-sys-shape-corner-full, 9999px)',
        '--md-sys-density-scale': '-2',
        ...style,
    };

    return(
        //@ts-expect-error
        <M3eButtonGroup variant="connected" style={groupStyle}>
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