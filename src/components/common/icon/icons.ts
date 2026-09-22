import { IconButtonProps } from "../iconButton/types";

export const getIcon = (name: IconButtonProps['name']): string => {
    switch(name) {
        case 'autorenew':
            return 'autorenew'
        case 'update':
            return 'update'
        case 'folder-managed':
            return 'folder_managed'
        case 'folder-open':
            return 'folder_open'
        case 'info':
            return 'info'
        case 'account':
            return 'person'
        case 'database':
            return 'database'
        case 'content-copy':
            return 'content_copy';
        case 'launch':
            return 'launch';
        case 'license':
            return 'license';
        default: 
            return null;
    }
};