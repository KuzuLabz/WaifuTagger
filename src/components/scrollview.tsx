import { Platform, ScrollView, ScrollViewProps } from 'react-native';
import { useAppTheme } from '../theme';
import { LegacyRef } from 'react';

export const ScrollViewStyled = (
	props: ScrollViewProps & {
		ref?: LegacyRef<ScrollView>;
		scrollbarStyle?: { railColor?: string; barColor?: string };
	},
) => {
	const { colors } = useAppTheme();
	return (
		<ScrollView
			ref={props.ref}
			{...props}
			showsVerticalScrollIndicator={Platform.OS === 'web' ? true : false}
			style={[
				props.style,
				{
					// @ts-expect-error
					scrollbarColor: `${props.scrollbarStyle?.barColor ?? colors.onSurfaceVariant} ${props.scrollbarStyle?.railColor ?? colors.surface}`,
				},
			]}
		/>
	);
};
