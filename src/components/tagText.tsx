import { Text, Surface, IconButton, Chip, Tooltip, Menu } from 'react-native-paper';
import { copyToClipboard } from '../utils';
import { Platform, Share, StyleSheet, View } from 'react-native';
import { useFormattedText } from '../hooks/useFormattedText';
import { InferenceTags, TextFormat } from '../types';
import { useAppTheme } from '../theme';
import { useState } from 'react';

type IconActionViewProps = {
	text?: string;
	format?: TextFormat;
	includeRating?: boolean;
	includeCharacter?: boolean;
	toggleRating: () => void;
	setFormat: () => void;
	toggleChar: () => void;
};
const IconActionView = ({
	text,
	format,
	includeRating,
	includeCharacter,
	setFormat,
	toggleChar,
	toggleRating,
}: IconActionViewProps) => {
	const { colors } = useAppTheme();
	const [isVis, setIsVis] = useState(false);
	return Platform.select<React.JSX.Element>({
		web: (
			<>
				<View
					style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-start', gap: 8 }}
				>
					<Chip compact mode="outlined">
						{`${text.split(',').length} Tags`}
					</Chip>
					<Tooltip title="Format" leaveTouchDelay={100}>
						<Chip
							compact
							mode="flat"
							onPress={setFormat}
							textStyle={{ textTransform: 'capitalize' }}
						>
							{format}
						</Chip>
					</Tooltip>
				</View>
				<IconButton
					icon={includeRating ? 'thermometer-check' : 'thermometer-minus'}
					onPress={toggleRating}
					style={{ alignSelf: 'flex-end' }}
				/>
				<IconButton
					icon={includeCharacter ? 'account' : 'account-outline'}
					onPress={toggleChar}
					style={{ alignSelf: 'flex-end' }}
				/>
				<View
					style={{
						width: StyleSheet.hairlineWidth,
						height: '85%',
						marginHorizontal: 6,
						backgroundColor: colors.outlineVariant,
					}}
				/>
				<IconButton
					icon="share-variant"
					onPress={() => Share.share({ message: text })}
					style={{ alignSelf: 'flex-end' }}
				/>
				<IconButton
					icon="content-copy"
					onPress={() => copyToClipboard(text)}
					style={{ alignSelf: 'flex-end' }}
				/>
			</>
		),
		native: (
			<>
				<View
					style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-start', gap: 8 }}
				>
					<Chip compact mode="outlined">
						{`${text.split(',').length} Tags`}
					</Chip>
					<Tooltip title="Format" leaveTouchDelay={100}>
						<Chip
							compact
							mode="flat"
							onPress={setFormat}
							textStyle={{ textTransform: 'capitalize' }}
						>
							{format}
						</Chip>
					</Tooltip>
				</View>
				<IconButton
					icon={includeRating ? 'thermometer-check' : 'thermometer-minus'}
					onPress={toggleRating}
					style={{ alignSelf: 'flex-end' }}
				/>
				<IconButton
					icon={includeCharacter ? 'account' : 'account-outline'}
					onPress={toggleChar}
					style={{ alignSelf: 'flex-end' }}
				/>
				<View
					style={{
						width: StyleSheet.hairlineWidth,
						height: '85%',
						marginHorizontal: 6,
						backgroundColor: colors.outlineVariant,
					}}
				/>
				<Menu
					visible={isVis}
					onDismiss={() => setIsVis(false)}
					anchor={<IconButton icon={'dots-vertical'} onPress={() => setIsVis(true)} />}
				>
					<Menu.Item title={'Share'} leadingIcon={'share-variant'} />
					<Menu.Item title={'Copy text'} leadingIcon={'content-copy'} />
				</Menu>
			</>
		),
	});
};

type TagTextProps = {
	tags: InferenceTags;
};
const TagText = ({ tags }: TagTextProps) => {
	const { text, format, includeCharacter, includeRating, toggleRating, setFormat, toggleChar } =
		useFormattedText(tags);
	return (
		<Surface style={{ margin: 10, borderRadius: 12, padding: 10, paddingBottom: 0 }}>
			<Text>{text}</Text>
			<View
				style={{
					flexDirection: 'row',
					justifyContent: 'flex-end',
					alignItems: 'center',
					paddingTop: 6,
				}}
			>
				<IconActionView
					text={text}
					includeRating={includeRating}
					includeCharacter={includeCharacter}
					format={format}
					setFormat={setFormat}
					toggleChar={toggleChar}
					toggleRating={toggleRating}
				/>
			</View>
		</Surface>
	);
};

export default TagText;
