import { M3eActionList, M3eListAction, M3eListItem } from '@m3e/react/list';
import { ListItemProps, ListProps } from './types';
import { M3eIcon } from '@m3e/react/icon';

export const ListItem = ({ title, description, onPress, mode='action', leadingIcon = null, trailing = null }: ListItemProps) => {
    const Item = mode === 'action' ? M3eListAction : M3eListItem;
    return(
        <Item onClick={onPress} >
            {leadingIcon?.web && <M3eIcon name={leadingIcon.web} slot="leading" />}
            {title}
            {description && <span slot="supporting-text">
                {description}
            </span>}
            {trailing}
        </Item>
    );
};

export const List = ({children, style}: ListProps) => {
    return(
        // @ts-expect-error
        <M3eActionList variant='segmented' style={style}>
            {children}
        </M3eActionList>
    );
};