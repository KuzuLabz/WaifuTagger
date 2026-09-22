import { IconButtonProps } from './types';
import { M3eIconButton } from '@m3e/react/icon-button';
import { CircularProgress } from '../progressBar';
import { Icon } from '../icon';

export const IconButton = ({name, size, isLoading, slot, variant, onPress}: IconButtonProps) => {
    return(
        <M3eIconButton onClick={onPress} slot={slot} size='medium'>
            {isLoading ? <CircularProgress variant={variant} value={0} indeterminate /> : <Icon name={name} size={size} />}
        </M3eIconButton>
    );
};