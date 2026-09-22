import { Button, Dialog as PaperDialog } from 'react-native-paper';
import { DialogProps } from './types';
import { router } from 'expo-router';

export const Dialog = (props: DialogProps) => {
    const ContentContainer =  props.scrollable ? PaperDialog.ScrollArea : PaperDialog.Content;

    const onDismiss = () => {
        props.onDismiss?.();
        router.back();
    };

    return(
        <PaperDialog {...props} onDismiss={onDismiss}>
            <PaperDialog.Title>{props.title}</PaperDialog.Title>
            <ContentContainer>
                {props.children}
            </ContentContainer>
            <PaperDialog.Actions>
                {props.actions.map((action) => 
                    <Button 
                        key={action.title} 
                        mode='text' 
                        onPress={() => {action.onPress?.(); (typeof action.autoDismiss === 'boolean' ? action.autoDismiss : true) && router.back();}}
                    >
                        {action.title}
                    </Button>
                )}
            </PaperDialog.Actions>
        </PaperDialog>
    );
};
