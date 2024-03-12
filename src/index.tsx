import { Image } from 'expo-image';
import { ImageChangeEvent, ScrollView, StyleSheet, View } from 'react-native';
import useModel from './hooks/useModel';
import {
	Appbar,
	Button,
	Chip,
	Headline,
	Icon,
	IconButton,
	Portal,
	ProgressBar,
	Surface,
	Text,
	TextInput,
} from 'react-native-paper';
import LoadingView from './components/loading';
import ImageSelector from './components/imageSelector';
import ResultSection from './components/section';
import TagText from './components/tagText';
import { AppInfo, AppSettings, InferenceConfigurator, TagInfo } from './components/dialogs';
import { useEffect, useRef, useState } from 'react';
import { InferenceTag } from './types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Footer from './components/footer';
import Constants from 'expo-constants';
import { useSettingsStore } from './store';

const Main = ({ updateTheme }: { updateTheme: (sourceColor: string) => void }) => {
	const scrollRef = useRef<ScrollView>(null);
	const { colorMode } = useSettingsStore();

	const [tagInfoVisible, setTagInfoVisible] = useState(false);
	const [configVisible, setConfigVisible] = useState(false);
	const [appInfoVisible, setAppInfoVisible] = useState(false);
	const [appSettingsVisible, setAppSettingsVisible] = useState(false);

	const [url, setUrl] = useState('');

	const [selectedTag, setSelectedTag] = useState<InferenceTag | null>(null);
	const {
		runInference,
		pickImage,
		takePicture,
		loadFromUrl,
		onImagePaste,
		imageColors,
		tags,
		image,
		loading,
		isInferLoading,
	} = useModel(scrollRef.current);

	const onTagSelect = (tag: InferenceTag) => {
		setSelectedTag(tag);
		setTagInfoVisible(true);
	};

	useEffect(() => {
		if (imageColors) {
			if (imageColors.platform === 'android') {
				updateTheme(imageColors[colorMode]);
			}
		}
	}, [imageColors]);

	return loading ? (
		<LoadingView />
	) : (
		<View style={{ height: '100%' }}>
			<Appbar.Header mode="center-aligned">
				<Appbar.Action
					icon={'information-outline'}
					onPress={() => setAppInfoVisible(true)}
				/>
				<Appbar.Content title={Constants.expoConfig?.name} />
				<Appbar.Action icon={'cog-outline'} onPress={() => setAppSettingsVisible(true)} />
			</Appbar.Header>
			<ScrollView
				ref={scrollRef}
				contentContainerStyle={{ flexGrow: 1 }}
				keyboardDismissMode="on-drag"
			>
				<View style={{ height: '100%' }}>
					<ImageSelector
						onImagePick={pickImage}
						image={image}
						isLoading={isInferLoading}
					/>
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
							onImageChange={onImagePaste}
							style={{ marginLeft: 10, flex: 1 }}
							autoFocus={false}
							right={
								url.length > 0 && (
									<TextInput.Icon icon="close" onPress={() => setUrl('')} />
								)
							}
							onSubmitEditing={(e) => loadFromUrl(e.nativeEvent.text)}
						/>
						<IconButton icon="camera" onPress={takePicture} />
					</View>
					<View
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							marginTop: 20,
							marginHorizontal: 10,
						}}
					>
						<Button mode="elevated" onPress={runInference} style={{ flexGrow: 1 }}>
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
							<TagText text={tags.ordered_tags.join(', ')} />
							<View>
								<ResultSection
									tags={tags?.character}
									title="Character"
									onTagSelect={onTagSelect}
								/>
								<ResultSection
									tags={tags?.rating}
									title="Ratings"
									onTagSelect={onTagSelect}
								/>
								<ResultSection
									tags={tags?.general}
									title={`General Tags`}
									onTagSelect={onTagSelect}
								/>
							</View>
						</>
					) : null}
					<View style={{ flex: 1 }} />
					<Footer />
				</View>
			</ScrollView>
			<Portal>
				<TagInfo
					visible={tagInfoVisible}
					onDismiss={() => setTagInfoVisible(false)}
					tag={selectedTag}
				/>
				<InferenceConfigurator
					visible={configVisible}
					onDismiss={() => setConfigVisible(false)}
				/>
				<AppInfo visible={appInfoVisible} onDismiss={() => setAppInfoVisible(false)} />
				<AppSettings
					visible={appSettingsVisible}
					onDismiss={() => setAppSettingsVisible(false)}
					updateTheme={(mode) => (imageColors ? updateTheme(imageColors[mode]) : null)}
				/>
			</Portal>
		</View>
	);
};

export default Main;

const styles = StyleSheet.create({
	container: {
		height: '100%',
	},
});
