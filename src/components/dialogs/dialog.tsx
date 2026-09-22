import { WebThemeProvider } from '../../providers/webTheme';
import { M3eDialog, M3eDialogAction, M3eDialogElement } from '@m3e/react/dialog';
import { M3eButton } from '@m3e/react/button';
import { ReactNode, useRef } from 'react';
import { DialogProps } from './types';
import { router } from 'expo-router';

const DialogAction = ({children, autoDismiss = true}: {children: ReactNode; autoDismiss?: boolean}) => {
    if (autoDismiss) {
        return(
            <M3eDialogAction returnValue='ok'>
                {children}
            </M3eDialogAction>
        );
    }

    return children
};

export const Dialog = ({ dismissable = true, ...props}: DialogProps) => {
    const dialogRef = useRef<M3eDialogElement>(null); 

    const handleClosed = (event: Event) => {
        if (event.target === dialogRef.current || event.target === event.currentTarget) {
            (new Promise(resolve => setTimeout(resolve, 100))).then(() => {
                router.canGoBack() && router.back();
            });
            
        }
    };

	return (
        <WebThemeProvider>
            <M3eDialog  
                ref={dialogRef} 
                open
                dismissible={dismissable} 
                onClosed={handleClosed}
                //@ts-expect-error web only styles
                style={{'--m3e-dialog-min-width': '75%', '--m3e-dialog-max-width': 1080}}
            >
                <span slot="header">{props.title}</span>
                {props.children}
                <div slot="actions" {...({ end: "" } as any)}>
                    {props.actions.map((action, idx) => 
                        <M3eButton autoFocus onClick={action.onPress} key={idx}><DialogAction autoDismiss={typeof action.autoDismiss === 'boolean' ? action.autoDismiss : true}>{action.title}</DialogAction></M3eButton>
                    )}
                </div>
            </M3eDialog>
        </WebThemeProvider>
    );
};

