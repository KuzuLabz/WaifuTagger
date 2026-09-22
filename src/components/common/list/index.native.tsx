import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppTheme } from '../../../providers/theme';
import { ListItemProps, ListProps } from './types';
import { Icon, Text } from 'react-native-paper';

export const ListItem = ({ title, description, leadingIcon, mode, onPress, trailing, isFirst, isLast }: ListItemProps) => {
    const { colors } = useAppTheme();

    const getItemRadius = () => {
        const defaultRadius = 16;
        const innerRadius = 4;

        return {
            borderTopLeftRadius: isFirst ? defaultRadius : innerRadius,
            borderTopRightRadius: isFirst ? defaultRadius : innerRadius,
            borderBottomLeftRadius: isLast ? defaultRadius : innerRadius,
            borderBottomRightRadius: isLast ? defaultRadius : innerRadius,
        };
    };

    const backgroundColor =
        mode === 'action'
            ? colors.surfaceContainer
            : colors.surfaceContainer;

    const textColor =
        mode === 'action'
            ? colors.onSurface
            : colors.onSurface;

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPress}
            disabled={!onPress}
            style={[
                styles.listItemContainer,
                getItemRadius(),
                { backgroundColor },
            ]}
        >
            {leadingIcon?.native && <View style={styles.leadingContainer}><Icon source={leadingIcon.native} size={16} /></View>}

            <View style={styles.contentContainer}>
                {title && <Text
                    variant="bodyLarge"
                    style={[styles.title, { color: textColor }]}
                    numberOfLines={1}
                >
                    {title}
                </Text>}
                {description && (
                    typeof description === 'string' ? (
                        <Text
                            variant="bodyMedium"
                            style={{ color: colors.onSurfaceVariant }}
                            numberOfLines={2}
                        >
                            {description}
                        </Text>
                    ) : (
                        description
                    )
                )}
            </View>

            {trailing && <View style={styles.trailingContainer}>{trailing}</View>}
        </TouchableOpacity>
    );
};

export const List = ({ children, style }: ListProps) => {
    const validChildren = React.Children.toArray(children).filter(React.isValidElement);
    const totalItems = validChildren.length;

    return (
        <View style={[styles.listWrapper, style]}>
            {validChildren.map((child, index) => {
                return React.cloneElement(child as React.ReactElement<ListItemProps>, {
                    isFirst: index === 0,
                    isLast: index === totalItems - 1,
                });
            })}
        </View>
    );
};

const styles = StyleSheet.create({
  listWrapper: {
    width: '100%',
    gap: 2,
  },
  listItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  leadingContainer: {
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontWeight: '400',
  },
  trailingContainer: {
    marginLeft: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});