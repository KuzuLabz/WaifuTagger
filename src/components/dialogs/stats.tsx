import { BasicDialogProps } from './types';
import { DialogStyled } from './dialog';
import { Dialog, Divider, List, Text } from 'react-native-paper';
import { Button } from '../common/button';
import { useStatsStore } from '../../store/stats';
import { ScrollViewStyled } from '../scrollview';
import { View } from 'react-native';
import { useAppTheme } from '../../theme';

const StatListItem = ({
	title,
	description,
	stat,
}: {
	title: string;
	description?: string;
	stat?: string | number;
}) => {
	return (
		<List.Item
			title={title}
			description={description}
			right={(props) => (stat !== null ? <Text {...props}>{stat}</Text> : null)}
		/>
	);
};

export const StatsDialog = ({ visible, onDismiss }: BasicDialogProps) => {
	const { colors } = useAppTheme();
	const { levelInfo, totalInfers, ranksInferred, isEnabled, resetStats, resetLevels } =
		useStatsStore();

	const onDone = () => {
		onDismiss();
	};

	const onReset = () => {
		resetStats();
		resetLevels();
	};

	if (!isEnabled) {
		return null;
	}

	return (
		<DialogStyled visible={visible} onDismiss={onDone}>
			<Dialog.Title selectable={false}>Statistics</Dialog.Title>
			<Dialog.ScrollArea>
				<ScrollViewStyled scrollbarStyle={{ railColor: colors.elevation.level3 }}>
					<List.Section title="Level Info">
						<StatListItem title="Level" stat={levelInfo.level} />
						<StatListItem
							title="XP"
							stat={`${levelInfo.xp} -> ${levelInfo.levelXpCap} (Lvl. ${levelInfo.level + 1})`}
						/>
					</List.Section>
					<List.Section title="Trackers">
						<StatListItem title="Total Inferences" stat={totalInfers} />
						<StatListItem title="Image Ranks" />
						<View style={{ paddingHorizontal: 24, gap: 6 }}>
							{Object.keys(ranksInferred).map((rank, idx) => (
								<View
									key={idx}
									style={{
										flexDirection: 'row',
										justifyContent: 'space-between',
										width: '100%',
										alignItems: 'center',
									}}
								>
									<Text>{rank}</Text>
									<Divider style={{ flexGrow: 1, marginHorizontal: 12 }} />
									<Text>{ranksInferred[rank]}</Text>
								</View>
							))}
						</View>
					</List.Section>
				</ScrollViewStyled>
			</Dialog.ScrollArea>
			<Dialog.Actions>
				<View style={{ flex: 1, alignItems: 'flex-start' }}>
					<Button webVariant="text" androidVariant="borderless" onPress={onReset}>
						Reset
					</Button>
				</View>

				<Button webVariant="text" androidVariant="borderless" onPress={onDone}>
					Done
				</Button>
			</Dialog.Actions>
		</DialogStyled>
	);
};
