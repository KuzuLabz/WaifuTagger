import { Text, Surface, IconButton, Chip, Tooltip, Menu } from 'react-native-paper';
import { copyToClipboard, shareText } from '../utils';
import { Platform, Share, StyleSheet, View } from 'react-native';
import { useFormattedText } from '../hooks/useFormattedText';
import { InferenceTags, TextFormat } from '../types';
import { useAppTheme } from '../theme';
import { useState } from 'react';
import { useLingui } from '@lingui/react/macro';

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
    const { t } = useLingui();
	const [isVis, setIsVis] = useState(false);

    const tagCount = `${text.split(',').length} ` + t`Tags`;

	return Platform.select<React.JSX.Element>({
		web: (
			<>
				<View
					style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-start', gap: 8 }}
				>
					<Chip compact mode="outlined">
						{tagCount}
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
					onPress={() => shareText(text)}
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
						{tagCount}
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
					<Menu.Item title={t`Share`} leadingIcon={'share-variant'} onPress={() => shareText(text)} />
					<Menu.Item title={t`Copy text`} leadingIcon={'content-copy'} onPress={() => copyToClipboard(text)} />
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
