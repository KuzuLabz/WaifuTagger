import { Platform, ScrollView, ScrollViewProps } from 'react-native';
import { Ref } from 'react';
import { useAppTheme } from '../providers/theme';

export const ScrollViewStyled = (
	props: ScrollViewProps & {
		ref?: Ref<ScrollView>;
		scrollbarStyle?: { railColor?: string; barColor?: string };
	},
) => {
	const { colors } = useAppTheme();
	return (
		<ScrollView
			{...props}
			showsVerticalScrollIndicator={Platform.OS === 'web' ? true : false}
			style={[
				props.style,
				{
					// @ts-expect-error
					scrollbarColor: `${props.scrollbarStyle?.barColor ?? colors.onSurfaceVariant} ${props.scrollbarStyle?.railColor ?? colors.surface}`,
                    scrollBehavior: 'smooth',
                    willChange: 'transform, scroll-position',
                },
			]}
		/>
	);
};
