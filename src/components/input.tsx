import { TextInput } from "react-native-paper";
import { ImageController } from "../utils/selector";
import { TextInput as RNTextInput } from "react-native";
import { M3eMenuElement } from "@m3e/react/menu";
import { ContextMenuTrigger } from "./common/contextMenu/contextMenu";
import { useLingui } from "@lingui/react/macro";
import { copyToClipboard, pasteFromClipboard } from "../utils/utils";
import { useRef } from "react";

export const UrlInput = ({ text, onTextChange }:{ text: string; onTextChange: (txt: string) => void; }) => {
    const { t } = useLingui();
    const inputRef = useRef<RNTextInput>(null);
    const menuRef = useRef<M3eMenuElement>(null);
    const anchorRef = useRef<HTMLDivElement>(null);

    const onCopy = () => {
        copyToClipboard(text);
    };

    const onPaste = async () => {
        const txt = await pasteFromClipboard();
        ImageController.fromPaste();
        text.startsWith('http') && onTextChange(txt);
    };

    const handleContextMenu = async (event: any) => {
        event.preventDefault();

        const menu = menuRef.current;
        const anchor = anchorRef.current;
        if (!menu || !anchor) return;

        const clientX = event.nativeEvent?.clientX ?? event.clientX;
        const clientY = event.nativeEvent?.clientY ?? event.clientY;

        anchor.style.left = `${clientX}px`;
        anchor.style.top = `${clientY}px`;

        if (typeof menu.show === 'function') {
            menu.show(anchor);
        }
    };

    return(
        <ContextMenuTrigger 
                actions={[{id: 'copy', title: t`Copy`}, {id: 'paste', title: t`Paste`}]} 
                onItemPress={(id) => {
                    switch(id) {
                        case 'copy':
                            onCopy();
                            return;
                        case 'paste':
                            onPaste();
                            return
                    }
                }}
                platforms={['web']}
            >
            <TextInput
                id="input"
                ref={inputRef}
                mode="outlined"
                label={t`Image URL`}
                value={text}
                {...({ onContextMenu: handleContextMenu } as any)}
                onChangeText={onTextChange}
                autoFocus={false}
                right={
                    text.length > 0 && <TextInput.Icon icon="close" onPress={() => onTextChange('')} />
                }
                onSubmitEditing={(e) => ImageController.fromUrl(e.nativeEvent.text)}
            />
        </ContextMenuTrigger>
    );
};