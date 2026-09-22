import { IconButtonProps } from "../iconButton/types";

export const getPaperIcon = (name: IconButtonProps['name']): string => {
    switch (name) {
        case 'account':
            return 'account';
        case 'autorenew':
            return 'autorenew';
        case 'database':
            return 'database';
        case 'folder-managed':
            return 'folder-edit-outline'
        case 'folder-open':
            return 'folder-open';
        case 'info':
            return 'information-outline';
        case 'update':
            return 'update';
        case 'content-copy':
            return 'content-copy';
        case 'launch':
            return 'launch';
        case 'license':
            return 'license';
    }
}