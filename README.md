# WaifuTagger
![banner](./banner.png)

<a href="https://huggingface.co/Smashinfries/wd-convnext-tagger-v3-mobile" target="_blank">
    <img alt="Hugging Face" src="https://img.shields.io/badge/%F0%9F%A4%97%20Model%20Card-ffc107?color=ffc107&logoColor=white" />
</a>
<a href="https://github.com/KuzuLabz/WaifuTagger/releases/latest" target="_blank">
    <img alt="Hugging Face" src="https://img.shields.io/badge/Android-Release-Release?logo=android" />
</a>


Run SmilingWolfs [wd-convnext-tagger-v3](https://huggingface.co/SmilingWolf/wd-convnext-tagger-v3) model on mobile!

## 🎉 Google Play Store
Google has proven they hate indie devs, so I won't be uploading anything there. I am considering F-Droid though. 

## 🎮 Platforms
Android is currently supported! 

I think iOS could easily be supported but I haven't tested it. Same goes for web.

## 🤗 Model
To run the model on mobile, I quantized it and added preprocessing using [onnxruntime-extentions](https://onnxruntime.ai/docs/extensions/). This model is available on my [HuggingFace](https://huggingface.co/Smashinfries/wd-convnext-tagger-v3-mobile). You can also find more details about the process there.

## 🎯 Model Accuracy
If you get bad results, it's highly likely that I did something wrong with the preprocessing. Any tips for improvement would be appreciated.

## Contributing
PRs are welcome!

### Development Setup
1. Download and install the latest dev build from releases
2. Clone repo
3. Run `yarn`
4. Download model and place it in assets/models
5. Run `yarn start`

#### iOS Notes
- This app uses [expo-share-intent](https://github.com/achorein/expo-share-intent) and will need additional setup for iOS.