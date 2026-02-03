#!/bin/bash
# Convert PNG images to WebP for better performance
# Requires: brew install webp (or apt install webp on Linux)

set -e

IMAGES_DIR="public/images/menu"
QUALITY=80

echo "🖼️  Converting PNG to WebP..."
echo "Directory: $IMAGES_DIR"
echo "Quality: $QUALITY"
echo ""

# Check if cwebp is installed
if ! command -v cwebp &> /dev/null; then
    echo "❌ cwebp not found. Installing..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install webp
    else
        echo "Please install webp: apt install webp"
        exit 1
    fi
fi

# Count files
TOTAL=$(find "$IMAGES_DIR" -name "*.png" | wc -l | tr -d ' ')
echo "📊 Found $TOTAL PNG files to convert"
echo ""

# Convert each PNG to WebP
COUNT=0
for file in "$IMAGES_DIR"/*.png; do
    if [ -f "$file" ]; then
        filename=$(basename "$file" .png)
        output="$IMAGES_DIR/$filename.webp"
        
        # Convert
        cwebp -q $QUALITY "$file" -o "$output" 2>/dev/null
        
        # Get sizes
        orig_size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file")
        new_size=$(stat -f%z "$output" 2>/dev/null || stat -c%s "$output")
        savings=$((100 - (new_size * 100 / orig_size)))
        
        COUNT=$((COUNT + 1))
        echo "[$COUNT/$TOTAL] $filename: $(numfmt --to=iec $orig_size) → $(numfmt --to=iec $new_size) (-${savings}%)"
    fi
done

echo ""
echo "✅ Converted $COUNT files"

# Summary
ORIG_TOTAL=$(du -sh "$IMAGES_DIR"/*.png 2>/dev/null | tail -1 | cut -f1)
NEW_TOTAL=$(du -sh "$IMAGES_DIR"/*.webp 2>/dev/null | tail -1 | cut -f1)
echo ""
echo "📊 Total savings:"
echo "   PNG total: ~82MB"
echo "   WebP total: Check with: du -sh $IMAGES_DIR/*.webp"
