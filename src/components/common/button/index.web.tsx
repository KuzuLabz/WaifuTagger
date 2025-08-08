import { Button as ButtonPaper } from 'react-native-paper';
import { ButtonProps } from './types';

export const Button = (props: ButtonProps) => {
	return <ButtonPaper {...props} mode={props.webVariant} />;
};
