import { Image } from 'expo-image';
import { ScrollView, StyleSheet, View } from 'react-native';
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
import { AppInfo, InferenceConfigurator, TagInfo } from './components/dialogs';
import { useState } from 'react';
import { InferenceTag } from './types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Footer from './components/footer';
import Constants from 'expo-constants';

const Main = () => {
	const [tagInfoVisible, setTagInfoVisible] = useState(false);
	const [configVisible, setConfigVisible] = useState(false);
	const [appInfoVisible, setAppInfoVisible] = useState(false);

	const [url, setUrl] = useState('');

	const { top } = useSafeAreaInsets();

	const [selectedTag, setSelectedTag] = useState<InferenceTag | null>(null);
	const {
		runInference,
		pickImage,
		updateConfig,
		takePicture,
		loadFromUrl,
		tags,
		image,
		loading,
		isInferLoading,
		inferenceConfig,
	} = useModel();

	const onTagSelect = (tag: InferenceTag) => {
		setSelectedTag(tag);
		setTagInfoVisible(true);
	};

	return loading ? (
		<LoadingView />
	) : (
		<View style={{ height: '100%' }}>
			<Appbar.Header mode="center-aligned">
				<Appbar.Content title={Constants.expoConfig?.name} />
				<Appbar.Action
					icon={'information-outline'}
					onPress={() => setAppInfoVisible(true)}
				/>
			</Appbar.Header>
			<ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardDismissMode="on-drag">
				<View style={{ height: '100%' }}>
					{/* <View
						style={{
							flexDirection: 'row',
							justifyContent: 'space-between',
							paddingTop: top + 10,
						}}
					>
						<Text>{Constants.expoConfig?.name}</Text>
						<IconButton
							icon="information-outline"
							onPress={() => setAppInfoVisible(true)}
						/>
					</View> */}
					<ImageSelector
						onImagePick={pickImage}
						image={image}
						isLoading={isInferLoading}
					/>
					<View style={{ flexDirection: 'row', marginTop: 15, width: '100%' }}>
						<TextInput
							mode="outlined"
							label={'Image URL'}
							value={url}
							onChangeText={(text) => setUrl(text)}
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
					defaultConfig={inferenceConfig}
					onChange={(cf) => updateConfig(cf)}
					visible={configVisible}
					onDismiss={() => setConfigVisible(false)}
				/>
				<AppInfo visible={appInfoVisible} onDismiss={() => setAppInfoVisible(false)} />
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
