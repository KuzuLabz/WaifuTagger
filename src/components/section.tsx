import { Pressable, View } from 'react-native';
import { InferenceTag, InferenceTags } from '../types';
import { Headline, useTheme } from 'react-native-paper';
import Result from './result';
import { copyToClipboard } from '../utils';

type RatingsProps = {
    title: string;
    tags?: InferenceTags['rating'];
    onTagSelect: (tag: InferenceTag) => void;
};
const ResultSection = ({ tags, title, onTagSelect }: RatingsProps) => {
    const { colors } = useTheme();
    if (!tags) return;
    return (
        <View style={{ marginVertical: 10 }}>
            <Headline style={{ marginLeft: 20 }}>{title}</Headline>
            <View
                style={{
                    alignSelf: 'center',
                    width: '90%',
                    padding: 10,
                }}
            >
                {/* {!tags ? (
                    <Text style={{ textAlign: 'center' }}>
                        Select image and run inference to see results!
                    </Text>
                ) : (
                    ratings.map((rating, idx) => (
                        <Result key={idx} probability={rating.probability} />
                    ))
                )} */}
                {/* <Result probability={0.8} name="General" />
                <Result probability={0.2} name="Sensitive" />
                <Result probability={0} name="Questionable" />
                <Result probability={0} name="Explicit" /> */}
                {tags?.map((tag, idx) => (
                    <Pressable
                        key={idx}
                        onPress={() => onTagSelect(tag)}
                        onLongPress={() => copyToClipboard(tag.name)}
                    >
                        <Result probability={tag.probability} name={tag.name} />
                    </Pressable>
                ))}
            </View>
        </View>
    );
};

export default ResultSection;
