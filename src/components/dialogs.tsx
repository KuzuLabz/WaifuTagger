import { Button, Dialog, IconButton, Text } from 'react-native-paper';
import { InferenceTag } from '../types';
import { Pressable, View } from 'react-native';
import { IconSource } from 'react-native-paper/lib/typescript/components/Icon';
import { ReactNode, useEffect, useState } from 'react';
import Slider from '@react-native-community/slider';
import { InferenceConfig } from '../storage';
import { useAsyncStorage } from '@react-native-async-storage/async-storage';

type BasicDialogProps = {
    visible: boolean;
    onDismiss: () => void;
};

const TagInfoSection = ({
    icon,
    children,
}: {
    icon: IconSource;
    children: ReactNode;
    isUser?: boolean;
}) => {
    return (
        <Pressable style={{ flexDirection: 'row' }}>
            <IconButton icon={icon} />
            <View style={{ flex: 1, justifyContent: 'center' }}>
                <Text>{children}</Text>
            </View>
        </Pressable>
    );
};

type TagInfoProps = BasicDialogProps & {
    tag: InferenceTag | null;
};
export const TagInfo = ({ tag, visible, onDismiss }: TagInfoProps) => {
    if (!tag) return null;
    return (
        <Dialog visible={visible} onDismiss={onDismiss}>
            <Dialog.Title>Tag Data</Dialog.Title>
            <Dialog.Content>
                <TagInfoSection icon="identifier">{tag.tag_id}</TagInfoSection>
                <TagInfoSection icon="tag-outline">
                    {typeof tag.name === 'string' ? tag.name.replaceAll('_', ' ') : tag.name}
                </TagInfoSection>
                <TagInfoSection icon="counter">{tag.count.toLocaleString()}</TagInfoSection>
                <TagInfoSection icon="folder-outline">
                    {tag.category === 0 ? 'General' : tag.category === 9 ? 'Rating' : 'Character'}
                </TagInfoSection>
            </Dialog.Content>
            <Dialog.Actions>
                <Button onPress={onDismiss}>Done</Button>
            </Dialog.Actions>
        </Dialog>
    );
};

type InferenceConfiguratorProps = BasicDialogProps & {
    onChange: (config: InferenceConfig) => void;
    defaultConfig: InferenceConfig;
};
export const InferenceConfigurator = ({
    visible,
    onDismiss,
    defaultConfig,
    onChange,
}: InferenceConfiguratorProps) => {
    const [newConfig, setNewConfig] = useState<InferenceConfig>(defaultConfig);

    const onSave = () => {
        onChange(newConfig);
        onDismiss();
    };

    return (
        <Dialog visible={visible} onDismiss={onDismiss}>
            <Dialog.Title>Inference Settings</Dialog.Title>
            <Dialog.Content>
                <Slider
                    step={0.05}
                    minimumValue={0.05}
                    maximumValue={1}
                    value={newConfig.character_threshold}
                    onValueChange={(val) =>
                        setNewConfig((prev) => ({ ...prev, character_threshold: val }))
                    }
                />
            </Dialog.Content>
            <Dialog.Actions>
                <Button onPress={onDismiss}>Cancel</Button>
                <Button onPress={onSave}>Save</Button>
            </Dialog.Actions>
        </Dialog>
    );
};
