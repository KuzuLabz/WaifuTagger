import { Platform, ScrollView, StatusBar, View } from 'react-native';
import useModel from './hooks/useModel';
import { Appbar, Button, Divider, IconButton, Portal, Text, TextInput } from 'react-native-paper';
import LoadingView from './components/loading';
import ImageSelector from './components/imageSelector';
import ResultSection from './components/section';
import TagText from './components/tagText';
import { useEffect, useRef, useState } from 'react';
import { InferenceTag } from './types';
import Footer from './components/footer';
import Constants from 'expo-constants';
import { useSettingsStore } from './store/settings';
import { AppSettings } from './components/dialogs/appSettings';
import { TagInfo } from './components/dialogs/tagInfo';
import { InferenceConfigurator } from './components/dialogs/inferConfig';
import { AppInfo } from './components/dialogs/appInfo';
import { useAppTheme } from './theme';
import { ScrollViewStyled } from './components/scrollview';
import { Image } from 'expo-image';
import { LevelView } from './components/levelView';
import { StatsDialog } from './components/dialogs/stats';
import { useStatsStore } from './store/stats';
import Color from 'color';
import { useTags } from './hooks/useTags';

const Main = ({ updateTheme }: { updateTheme: (sourceColor: string) => void }) => {
	const scrollRef = useRef<ScrollView>(null);
	const { colorMode } = useSettingsStore();
	const { isEnabled: isRankEnabled } = useStatsStore();
	const { colors } = useAppTheme();

	const [tagInfoVisible, setTagInfoVisible] = useState(false);
	const [configVisible, setConfigVisible] = useState(false);
	const [appInfoVisible, setAppInfoVisible] = useState(false);
	const [appSettingsVisible, setAppSettingsVisible] = useState(false);
	const [statVisible, setStatVisible] = useState(false);

	const [url, setUrl] = useState('');

	const [selectedTag, setSelectedTag] = useState<InferenceTag | null>(null);
	const {
		runInference,
		pickImage,
		takePicture,
		loadFromUrl,
		isInferDisabled,
		imageColors,
		tags,
		image,
		loading,
		isInferLoading,
	} = useModel(scrollRef.current);
	const { characterTags, generalTags } = useTags(tags);

	const onTagSelect = (tag: InferenceTag) => {
		setSelectedTag(tag);
		setTagInfoVisible(true);
	};

	useEffect(() => {
		if (imageColors) {
			updateTheme(imageColors[colorMode]);
		}
	}, [imageColors]);

	return loading ? (
		<LoadingView />
	) : (
		<View
			// @ts-expect-error: 100vh is web only
			style={{
				backgroundColor: colors.surface,
				height: Platform.select({ web: '100vh', native: '100%' }),
			}}
		>
			<ScrollViewStyled
				ref={scrollRef}
				contentContainerStyle={{ flexGrow: 1 }}
				keyboardDismissMode="on-drag"
				stickyHeaderIndices={[0]}
				stickyHeaderHiddenOnScroll
			>
				<Appbar.Header
					mode="center-aligned"
					style={[
						Platform.select({
							web: {
								width: '100%',
								backgroundColor: Color(colors.surface).alpha(0.4).rgb().string(),
								backdropFilter: 'blur(10px)',
							},
							native: undefined,
						}),
					]}
				>
					<Appbar.Action
						icon={'information-outline'}
						onPress={() =>
							Platform.OS === 'web' || Platform.OS === 'ios'
								? setAppInfoVisible(true)
								: null
						}
						onPressIn={() =>
							Platform.OS === 'android' ? setAppInfoVisible(true) : null
						}
					/>
					<Appbar.Content
						title={
							<View style={{ flexDirection: 'row', alignItems: 'center' }}>
								<Image
									pointerEvents="none"
									source={require('../assets/adaptive-icon.png')}
									style={{ height: 32, aspectRatio: 1 }}
								/>
								<Text variant="titleLarge" selectable={false}>
									{Constants.expoConfig?.name}
								</Text>
							</View>
						}
					/>
					{isRankEnabled && (
						<Appbar.Action
							icon={'trophy-variant-outline'}
							onPress={() =>
								Platform.OS === 'web' || Platform.OS === 'ios'
									? setStatVisible(true)
									: null
							}
							onPressIn={() =>
								Platform.OS === 'android' ? setStatVisible(true) : null
							}
						/>
					)}
					<Appbar.Action
						icon={'cog-outline'}
						onPress={() =>
							Platform.OS === 'web' || Platform.OS === 'ios'
								? setAppSettingsVisible(true)
								: null
						}
						onPressIn={() =>
							Platform.OS === 'android' ? setAppSettingsVisible(true) : null
						}
					/>
				</Appbar.Header>
				<View style={{ flex: 1 }}>
					<ImageSelector
						onImagePick={pickImage}
						image={image}
						isLoading={isInferLoading}
						rank={tags?.rank}
					/>
					<LevelView isLoading={isInferLoading} />
					<Divider bold />
					<View
						style={{
							flexDirection: 'row',
							marginTop: 15,
							width: '100%',
							alignItems: 'center',
						}}
					>
						<TextInput
							mode="outlined"
							label={'Image URL'}
							value={url}
							onChangeText={(text) => setUrl(text)}
							style={{ marginHorizontal: 10, flex: 1 }}
							autoFocus={false}
							right={
								url.length > 0 && (
									<TextInput.Icon icon="close" onPress={() => setUrl('')} />
								)
							}
							onSubmitEditing={(e) => loadFromUrl(e.nativeEvent.text)}
						/>
						{Platform.OS !== 'web' && (
							<IconButton icon="camera" onPress={takePicture} />
						)}
					</View>
					<View
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							marginTop: 20,
							marginHorizontal: 10,
						}}
					>
						<Button
							mode="contained-tonal"
							onPress={runInference}
							style={{ flexGrow: 1 }}
							disabled={isInferDisabled && isRankEnabled}
						>
							Run Inference
						</Button>
						<IconButton
							style={{ flexShrink: 1 }}
							icon={'tune-vertical-variant'}
							onPress={() => setConfigVisible(true)}
						/>
					</View>
					{tags ? (
						<>
							<TagText
								tags={{ ...tags, character: characterTags, general: generalTags }}
							/>
							<View>
								<ResultSection
									tags={characterTags}
									title="Character"
									onTagSelect={onTagSelect}
								/>
								<ResultSection
									tags={tags?.rating}
									title="Ratings"
									onTagSelect={onTagSelect}
								/>
								<ResultSection
									tags={generalTags}
									title={`General`}
									onTagSelect={onTagSelect}
								/>
							</View>
						</>
					) : null}
					<View style={{ flex: 1 }} />
					<Footer />
				</View>
			</ScrollViewStyled>
			<View
				style={{
					position: 'absolute',
					top: 0,
					width: '100%',
					height: StatusBar.currentHeight,
					backgroundColor: colors.surface,
				}}
			/>

			<Portal>
				<AppSettings
					visible={appSettingsVisible}
					onDismiss={() => setAppSettingsVisible(false)}
					updateTheme={(mode) => (imageColors ? updateTheme(imageColors[mode]) : null)}
				/>
				<TagInfo
					visible={tagInfoVisible}
					onDismiss={() => setTagInfoVisible(false)}
					tag={selectedTag}
				/>
				<InferenceConfigurator
					visible={configVisible}
					onDismiss={() => setConfigVisible(false)}
				/>
				<StatsDialog visible={statVisible} onDismiss={() => setStatVisible(false)} />
				<AppInfo visible={appInfoVisible} onDismiss={() => setAppInfoVisible(false)} />
			</Portal>
		</View>
	);
};

export default Main;
