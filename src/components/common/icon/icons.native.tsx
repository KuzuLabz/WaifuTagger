import Update from '@expo/material-symbols/update.xml';
import { IconProps } from './types';
import { Icon } from '@expo/ui';

export const getIcon = (name: IconProps['name']) => {
    switch(name) {
        case 'autorenew':
            return Icon.select({
                android: import('@expo/material-symbols/autorenew.xml'),
                ios: 'arrow.triangle.2.circlepath'
            });
        case 'update':
            return Icon.select({
                android: import('@expo/material-symbols/update.xml'),
                ios: 'clock.arrow.2.circlepath'
            });
        case 'folder-managed':
            return Icon.select({
                android: import('@expo/material-symbols/folder_managed.xml'),
                ios: 'folder.badge.gearshape'
            });
        case 'folder-open':
            return Icon.select({
                android: import('@expo/material-symbols/folder_open.xml'),
                ios: 'folder'
            })
        case 'info':
            return Icon.select({
                android: import('@expo/material-symbols/info.xml'),
                ios: 'info'
            });
        case 'account':
            return Icon.select({
                android: import('@expo/material-symbols/person.xml'),
                ios: 'person'
            });
        case 'database':
            return Icon.select({
                android: import('@expo/material-symbols/database.xml'),
                ios: 'cylinder.split.1x2'
            });
        case 'content-copy':
            return Icon.select({
                android: import('@expo/material-symbols/content_copy.xml'),
                ios: 'doc.on.doc'
            });
        case 'launch':
            return Icon.select({
                android: import('@expo/material-symbols/open_in_new.xml'),
                ios: undefined
            });
        case 'license':
            return Icon.select({
                android: import('@expo/material-symbols/license.xml'),
                ios: undefined
            });
        default: 
            return null;
    }
};