import { Dialog, DialogProps } from 'react-native-paper';
import { Platform, StyleSheet, useWindowDimensions } from 'react-native';

export const DialogStyled = (props: DialogProps) => {
	return <Dialog {...props} style={[style.root]} />;
};

const style = StyleSheet.create({
	root: Platform.select({
		web: {
			maxWidth: 1080,
			width: '95%',
			alignSelf: 'center',
			maxHeight: '95%',
		},
	}),
});
