# Password Page Customization Guide

This guide explains the customizations made to your Shopify password page to fix SVG logo issues, add logo positioning options, and implement video background functionality.

## 🎯 What Was Fixed/Added

### 1. SVG Logo Support
- **Problem**: SVG logos weren't displaying properly on the password page
- **Solution**: Enhanced logo handling with proper SVG support and responsive sizing
- **Files Modified**: `sections/main-password.liquid`, `assets/password.css`

### 2. Logo Positioning Options
- **New Feature**: Ability to position logos left, center, or right
- **Options**: 
  - `logo-position-left`: Aligns logo to the left
  - `logo-position-center`: Centers the logo (default)
  - `logo-position-right`: Aligns logo to the right
- **Files Modified**: `sections/main-password.liquid`, `assets/password.css`

### 3. Video Background with Fallback Image
- **New Feature**: Full-screen video background with automatic fallback to image
- **Benefits**: 
  - Professional look with engaging video content
  - Automatic fallback if video fails to load
  - Mobile-optimized with proper fallback handling
- **Files Modified**: `sections/main-password.liquid`, `assets/password.css`, `assets/password.js`

## 📁 Files Modified

### 1. `sections/main-password.liquid`
- Enhanced logo container with positioning classes
- Added video background section with fallback image support
- Improved SVG logo handling
- Added new section settings for customization

### 2. `assets/password.css`
- Added new CSS classes for logo positioning
- Enhanced logo styling with proper SVG support
- Added video background styling
- Responsive design improvements

### 3. `assets/password.js` (New File)
- Video background functionality
- Fallback image handling
- Mobile device optimization
- Logo positioning logic

### 4. `layout/password.liquid`
- Added password.js script reference

## 🎨 How to Use the New Features

### Logo Positioning
1. In your Shopify admin, go to **Online Store > Themes**
2. Click **Customize** on your active theme
3. Navigate to the password page
4. In the **Main Password** section, you'll see a new **Logo Position** setting
5. Choose from:
   - **Left**: Logo aligns to the left side
   - **Center**: Logo centers (default)
   - **Right**: Logo aligns to the right side

### Video Background
1. In the **Main Password** section settings, you'll find new video options:
   - **Video URL**: Enter a YouTube or Vimeo video URL
   - **Hosted Video**: Upload your own video file
   - **Fallback Image**: Upload an image that displays if video fails to load
2. The video will automatically:
   - Play in the background
   - Loop continuously
   - Fall back to the image if there are any issues
   - Optimize for mobile devices

### SVG Logo Upload
1. Upload your SVG logo file through the logo setting
2. The logo will now display properly with:
   - Responsive sizing (200px max on mobile, 300px max on desktop)
   - Proper SVG rendering
   - Maintained aspect ratio
   - Positioned according to your chosen alignment

## 🔧 Technical Details

### CSS Classes Added
- `.password-logo-container`: Main logo container
- `.logo-position-left/center/right`: Logo positioning classes
- `.password-video-background`: Video background container
- `.video-fallback`: Fallback image styling
- `.video-overlay`: Video overlay for better text readability

### JavaScript Features
- Automatic video error handling
- Mobile device optimization
- Fallback image display logic
- Logo positioning class management

### Responsive Design
- Mobile-first approach
- Adaptive logo sizing
- Video fallback for mobile devices
- Proper z-index layering

## 🚀 Performance Considerations

- Videos are muted and looped for better performance
- Fallback images are optimized for fast loading
- SVG logos are lightweight and scalable
- CSS is minified and optimized

## 🐛 Troubleshooting

### Logo Not Displaying
1. Check that your logo file is properly uploaded
2. Ensure the logo setting is enabled in the section
3. Verify the logo position setting is selected

### Video Not Playing
1. Check that the video URL is correct and accessible
2. Ensure the fallback image is uploaded
3. The fallback image will automatically display if video fails

### Logo Positioning Issues
1. Clear your browser cache
2. Check that the logo position setting is saved
3. Verify the CSS is loading properly

## 📱 Mobile Optimization

- Videos automatically fall back to images on mobile
- Logo sizing is optimized for small screens
- Touch-friendly interactions
- Responsive layout adjustments

## 🔄 Future Enhancements

The current implementation provides a solid foundation for:
- Additional logo positioning options
- Multiple video sources
- Advanced video controls
- Custom overlay effects
- Animation options

## 📞 Support

If you encounter any issues with these customizations:
1. Check that all files are properly uploaded
2. Verify the theme is published
3. Clear browser cache and cookies
4. Test in different browsers and devices

---

**Note**: These customizations are designed to work with your existing theme structure and maintain compatibility with future theme updates. Always test thoroughly before going live with changes.
