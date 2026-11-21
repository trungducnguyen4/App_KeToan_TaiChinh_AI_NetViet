#!/usr/bin/env python3
"""
create_visual_gif.py
Helper script to package sequential screenshots into high-quality animated GIFs
for inline display in GitHub Pull Requests according to the Visual Proof standard.

Usage:
    python scripts/create_visual_gif.py --inputs frame1.png frame2.png frame3.png --output docs/screenshots/nv-flow.gif
    python scripts/create_visual_gif.py --dir docs/screenshots/frames/ --output docs/screenshots/nv-flow.gif
"""

import os
import sys
import argparse
from PIL import Image

def build_gif(image_paths, output_path, target_width=1100, frame_duration=800, last_frame_duration=3000):
    if not image_paths:
        print("Error: No images provided.")
        sys.exit(1)

    loaded_frames = []
    for idx, path in enumerate(image_paths):
        if not os.path.exists(path):
            print(f"Warning: File not found: {path}")
            continue
        im = Image.open(path).convert("RGBA")
        
        # Calculate proportional height
        w, h = im.size
        target_h = int(h * (target_width / w))
        resized = im.resize((target_width, target_h), Image.Resampling.LANCZOS)
        
        # Convert RGBA to RGB with clean white background for smooth GIF rendering
        bg = Image.new("RGB", resized.size, (255, 255, 255))
        bg.paste(resized, mask=resized.split()[3])
        loaded_frames.append(bg)

    if not loaded_frames:
        print("Error: No valid frames loaded.")
        sys.exit(1)

    # Durations per frame in milliseconds
    durations = [frame_duration] * (len(loaded_frames) - 1) + [last_frame_duration]
    
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    
    loaded_frames[0].save(
        output_path,
        save_all=True,
        append_images=loaded_frames[1:],
        duration=durations,
        loop=0,
        optimize=True
    )
    print(f"✅ Successfully created animated GIF: {output_path} ({len(loaded_frames)} frames)")

def main():
    parser = argparse.ArgumentParser(description="Create animated GIF from screenshots for PR visual proof.")
    parser.add_argument("--inputs", nargs="+", help="Ordered list of image file paths")
    parser.add_argument("--dir", help="Directory containing numbered screenshot frames (e.g., frame_01.png, frame_02.png)")
    parser.add_argument("--output", required=True, help="Destination .gif file path")
    parser.add_argument("--width", type=int, default=1100, help="Target image width (default: 1100)")
    parser.add_argument("--duration", type=int, default=1000, help="Duration for standard frames in ms (default: 1000)")
    parser.add_argument("--last-duration", type=int, default=3000, help="Duration for final frame in ms (default: 3000)")

    args = parser.parse_args()

    files = []
    if args.inputs:
        files = args.inputs
    elif args.dir:
        files = sorted([
            os.path.join(args.dir, f) for f in os.listdir(args.dir)
            if f.lower().endswith((".png", ".jpg", ".jpeg", ".webp"))
        ])

    build_gif(files, args.output, args.width, args.duration, args.last_duration)

if __name__ == "__main__":
    main()
