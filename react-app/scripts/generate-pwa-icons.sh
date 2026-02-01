#!/bin/bash
set -e

# Colors
GREEN='#4ade80'
WHITE='#ffffff'

# Directories
PUBLIC_DIR="./public"
TEMP_DIR="./temp_icons"

mkdir -p "$TEMP_DIR"

echo "Generating base icon..."
# Create a 1024x1024 base icon with green background and white "CAD" text
magick -size 1024x1024 xc:"$GREEN" \
  -fill "$WHITE" -font Arial -pointsize 400 -gravity center -annotate 0 "CAD" \
  "$TEMP_DIR/base-icon.png"

echo "Generating PWA icons..."
# Standard Icons
magick "$TEMP_DIR/base-icon.png" -resize 64x64 "$PUBLIC_DIR/pwa-64x64.png"
magick "$TEMP_DIR/base-icon.png" -resize 192x192 "$PUBLIC_DIR/pwa-192x192.png"
magick "$TEMP_DIR/base-icon.png" -resize 512x512 "$PUBLIC_DIR/pwa-512x512.png"

# Maskable Icon (safe area padding)
# For maskable, we add some padding so the content isn't cut off by circle crop
magick "$TEMP_DIR/base-icon.png" -resize 80% -background "$GREEN" -gravity center -extent 1024x1024 \
  -resize 512x512 "$PUBLIC_DIR/maskable-icon-512x512.png"

# Apple Touch Icon (180x180, square, no transparency)
magick "$TEMP_DIR/base-icon.png" -resize 180x180 "$PUBLIC_DIR/apple-touch-icon.png"

# Favicon (ICO contains 16x16, 32x32, 48x48)
magick "$TEMP_DIR/base-icon.png" -define icon:auto-resize=48,32,16 "$PUBLIC_DIR/favicon.ico"

# Mask Icon (SVG for Safari pinned tab) - Monochrome
# Creating a simple SVG with text "CAD"
cat > "$PUBLIC_DIR/mask-icon.svg" <<EOF
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="black"/>
  <text x="50" y="65" font-family="Arial" font-size="50" fill="white" text-anchor="middle" font-weight="bold">CAD</text>
</svg>
EOF

# Clean up
rm -rf "$TEMP_DIR"

echo "Icons generated successfully in $PUBLIC_DIR"
ls -lh "$PUBLIC_DIR"
