package main

import (
	"bytes"
	"context"
	"crypto/md5"
	"encoding/base64"
	"fmt"
	"image"
	_ "image/jpeg"
	_ "image/png"
	"io"
	"mime"
	"net/http"
	"os"
	"path/filepath"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called at application startup
func (a *App) startup(ctx context.Context) {
	// Perform your setup here
	a.ctx = ctx
}

// domReady is called after front-end resources have been loaded
func (a App) domReady(ctx context.Context) {
	// Add your action here
}

// beforeClose is called when the application is about to quit,
// either by clicking the window close button or calling runtime.Quit.
// Returning true will cause the application to continue, false will continue shutdown as normal.
func (a *App) beforeClose(ctx context.Context) (prevent bool) {
	return false
}

// shutdown is called at application termination
func (a *App) shutdown(ctx context.Context) {
	// Perform your teardown here
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

func (a *App) UrlToBase64(url string) string {
	resp, err := http.Get(url)
	if err != nil {
		fmt.Printf("ImageUrlToBase64 Download Error: %s\n", err)
	}

	defer resp.Body.Close()

	bytes, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Printf("ImageUrlToBase64 Read Error: %s\n", err)
		return ""
	}

	var base64Encoding string
	mimeType := http.DetectContentType(bytes)

	switch mimeType {
		case "image/jpeg":
			base64Encoding += "data:image/jpeg;base64,"
		case "image/png":
			base64Encoding += "data:image/png;base64,"
	}

	base64Encoding += base64.StdEncoding.EncodeToString(bytes)
	return base64Encoding
}

// ImageInfo contains the base64 string and dimensions of the image
type ImageInfo struct {
	Base64String string
	Width        int
	Height       int
	Filename     string
	MimeType     string
	DataURI      string
}
type ImageDialogResult struct {
	ImageInfo
	LocalUri string
}

func getImageUriToB64(filePath string) (ImageInfo, error) {
	var result ImageInfo

	println(filePath)

	// Normalize file path to handle backslashes on Windows
	cleanPath := filepath.Clean(filePath)

	println(cleanPath)

	// Read the image file
	imgData, err := os.ReadFile(cleanPath)
	if err != nil {
		return result, err
	}

	// Convert to base64
	result.Base64String = base64.StdEncoding.EncodeToString(imgData)

	// Decode image to get dimensions
	img, format, err := image.Decode(bytes.NewReader(imgData))
	if err != nil {
		return result, err
	}

	// Get image dimensions
	bounds := img.Bounds()
	result.Width = bounds.Max.X
	result.Height = bounds.Max.Y

	// Get filename
	result.Filename = filepath.Base(cleanPath)

	// Get MIME type
	result.MimeType = mime.TypeByExtension("." + format)
	if result.MimeType == "" {
		result.MimeType = "image/" + format
	}

	// Create data URI
	result.DataURI = fmt.Sprintf("data:%s;base64,%s", result.MimeType, result.Base64String)

	return result, nil
}

// ConvertImageToBase64 converts a local image file to base64 and gets its dimensions
func (a *App) ConvertImageToBase64(filePath string) (ImageInfo, error) {
	return getImageUriToB64(filePath)
}

func (a *App) OpenImageDialog(defaultDir string) (ImageDialogResult, error) {
	loc, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select Image",
		DefaultDirectory: defaultDir,
		Filters: []runtime.FileFilter{
            {
                DisplayName: "Waifus (*.png;*.jpg;*.jpeg)",
                Pattern:     "*.png;*.jpg;*jpeg",
            },
        },
	})
	if err != nil {
        fmt.Printf("SaveFileDialog Error: %s\n", err)
        return ImageDialogResult{}, err
    }
	imageInfo, err := getImageUriToB64(loc)
	return ImageDialogResult{
		ImageInfo: imageInfo,
		LocalUri: loc,
	}, err
	// OpenFileDialog(ctx context.Context, dialogOptions OpenDialogOptions) (string, error)
}

func (a *App) GetImageMD5(base64String string) (string) {
	imgBytes, err := base64.StdEncoding.DecodeString(base64String)
	if err != nil {
		fmt.Println("Error decoding Base64:", err)
		return ""
	}

	hasher := md5.New()
	_, err = hasher.Write(imgBytes)
	if err != nil {
		fmt.Println("Error hashing data:", err)
		return ""
	}

	hash := hasher.Sum(nil)
	hashString := fmt.Sprintf("%x", hash)

	return hashString
}