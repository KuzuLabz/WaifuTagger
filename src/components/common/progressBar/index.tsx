import { M3eCircularProgressIndicator, M3eLinearProgressIndicator } from '@m3e/react/progress-indicator'
import { ProgressBarProps } from './types';

export const ProgressBar = ({value, max, indeterminate, variant = 'wavy', slot}: ProgressBarProps) => {
    return(
        <M3eLinearProgressIndicator
            variant={variant === 'linear' ? 'flat' : 'wavy'}
            mode={indeterminate ? 'indeterminate' : 'determinate'} 
            value={value}
            max={max}
            slot={slot}
        />
    );
};

export const CircularProgress = ({value, max, indeterminate, variant = 'wavy', slot}: ProgressBarProps) => {
    return(
        <M3eCircularProgressIndicator 
            value={value * 100}
            indeterminate={indeterminate}
            variant={variant === 'linear' ? 'flat' : 'wavy'}
            max={max}
            slot={slot}
        />
    );
};