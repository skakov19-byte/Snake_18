# Snake Game - Level Images Setup

## How to Add Custom Level Images

The game automatically loads level images from the `public/photo` folder.

### File Naming Convention

Name your image files as follows:
- `level1.jpg` - Image for Level 1
- `level2.jpg` - Image for Level 2
- `level3.jpg` - Image for Level 3
- `level4.jpg` - Image for Level 4 (and so on...)

### Supported Formats

- JPG/JPEG
- PNG
- GIF
- WebP

### Instructions

1. Place your images in the `public/photo/` folder
2. Name them according to the level number (e.g., `level1.jpg`, `level2.png`)
3. The game will automatically detect and use them

### Example Structure

```
public/
  photo/
    level1.jpg
    level2.jpg
    level3.jpg
    README.md
```

### Fallback Images

If a local image file is not found, the game will automatically use fallback images. You don't need to worry about broken images.

### Adding More Levels

To add more levels:
1. Create additional image files (level4.jpg, level5.jpg, etc.)
2. The game will automatically detect them and add new levels

### Notes

- Images should be square (1:1 aspect ratio) for best results
- Recommended size: 512x512 pixels or larger
- The game will scale images to fit the grid
- You can also upload custom images through the game UI (desktop only)
