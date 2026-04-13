#!/usr/bin/env python3
"""
Enhanced Fast Image Optimizer for Mac
Converts images to WebP format with white padding
Supports nested folders and maintains folder structure
Run: python3 optimize_images_webp.py
"""

from PIL import Image
import os
import shutil
from pathlib import Path
import time
from concurrent.futures import ProcessPoolExecutor
import multiprocessing

# WebP optimization presets
WEBP_PRESETS = {
    "thumbnail": {"size": 400, "quality": 80, "description": "Small thumbnails"},
    "gallery": {"size": 800, "quality": 85, "description": "Product galleries"},
    "display": {"size": 1024, "quality": 85, "description": "Main product display"},
    "premium": {"size": 1200, "quality": 90, "description": "Premium quality"},
    "lossless": {"size": 1024, "quality": 100, "description": "Lossless compression"}
}

def find_all_images(root_folder):
    """Recursively find all image files in nested folders"""
    supported_formats = ('.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.webp', '.JPG', '.JPEG', '.PNG', '.BMP', '.TIFF', '.WEBP', '.HEIC', '.heic')
    image_files = []
    
    for root, dirs, files in os.walk(root_folder):
        for file in files:
            if file.lower().endswith(supported_formats):
                full_path = os.path.join(root, file)
                # Calculate relative path from root folder
                relative_path = os.path.relpath(full_path, root_folder)
                image_files.append((full_path, relative_path))
    
    return image_files

def convert_single_image(args):
    """Process a single image to WebP format - designed for multiprocessing"""
    input_path, relative_path, output_folder, target_size, quality = args
    
    try:
        # Open and convert image
        img = Image.open(input_path)
        original_size = os.path.getsize(input_path)
        
        # Convert to RGB if needed
        if img.mode in ['RGBA', 'LA']:
            # Handle transparency by creating white background
            background = Image.new('RGB', img.size, 'white')
            if img.mode == 'RGBA':
                background.paste(img, mask=img.split()[-1])  # Use alpha channel as mask
            else:
                background.paste(img)
            img = background
        elif img.mode != 'RGB':
            img = img.convert('RGB')
        
        original_width, original_height = img.size
        
        # Calculate new dimensions maintaining aspect ratio
        if original_width > original_height:
            new_width = target_size
            new_height = int((original_height * target_size) / original_width)
        elif original_height > original_width:
            new_height = target_size
            new_width = int((original_width * target_size) / original_height)
        else:
            new_width = new_height = target_size
        
        # Resize with high-quality resampling
        img_resized = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # Create square white background
        square_img = Image.new('RGB', (target_size, target_size), 'white')
        
        # Center the image
        x_offset = (target_size - new_width) // 2
        y_offset = (target_size - new_height) // 2
        square_img.paste(img_resized, (x_offset, y_offset))
        
        # Create output path maintaining folder structure
        name, ext = os.path.splitext(relative_path)
        output_relative = f"{name}.webp"
        output_path = os.path.join(output_folder, output_relative)
        
        # Create output directory if it doesn't exist
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Save as WebP with optimization
        if quality == 100:
            # Lossless WebP
            square_img.save(output_path, 'WEBP', lossless=True, optimize=True, method=6)
        else:
            # Lossy WebP
            square_img.save(output_path, 'WEBP', quality=quality, optimize=True, method=6)
        
        final_size = os.path.getsize(output_path)
        compression_ratio = (1 - final_size / original_size) * 100 if original_size > 0 else 0
        
        return {
            'success': True,
            'filename': relative_path,
            'original_size': original_size,
            'final_size': final_size,
            'compression': compression_ratio
        }
        
    except Exception as e:
        return {
            'success': False,
            'filename': relative_path,
            'error': str(e)
        }

def batch_process_nested_folders(input_folder, output_folder, config, max_workers=None):
    """Process images in nested folders in parallel for maximum speed"""
    
    # Create output folder
    os.makedirs(output_folder, exist_ok=True)
    
    # Find all image files recursively
    print("🔍 Scanning for images in nested folders...")
    image_files = find_all_images(input_folder)
    
    if not image_files:
        print("❌ No image files found!")
        return
    
    # Display folder structure
    folders = set()
    for _, relative_path in image_files:
        folder = os.path.dirname(relative_path)
        if folder:  # Not empty (root folder)
            folders.add(folder)
    
    if folders:
        print(f"📁 Found {len(image_files)} images across {len(folders)} folders:")
        for folder in sorted(folders):
            count = sum(1 for _, rel_path in image_files if os.path.dirname(rel_path) == folder)
            print(f"   📂 {folder}: {count} images")
    else:
        print(f"📁 Found {len(image_files)} images in root folder")
    
    print(f"🎯 Config: {config['size']}x{config['size']}px, {config['quality']}% WebP quality")
    
    # Use all CPU cores minus one, or specified number
    if max_workers is None:
        max_workers = max(1, multiprocessing.cpu_count() - 1)
    print(f"🚀 Using {max_workers} CPU cores for parallel processing")
    
    # Prepare arguments for parallel processing
    process_args = []
    for full_path, relative_path in image_files:
        process_args.append((full_path, relative_path, output_folder, config['size'], config['quality']))
    
    print(f"⏳ Converting {len(image_files)} images to WebP format...")
    print("-" * 60)
    
    start_time = time.time()
    
    # Process in parallel
    with ProcessPoolExecutor(max_workers=max_workers) as executor:
        results = list(executor.map(convert_single_image, process_args))
    
    end_time = time.time()
    processing_time = end_time - start_time
    
    # Calculate statistics
    successful = [r for r in results if r['success']]
    failed = [r for r in results if not r['success']]
    
    if successful:
        total_original = sum(r['original_size'] for r in successful) / (1024 * 1024)  # MB
        total_final = sum(r['final_size'] for r in successful) / (1024 * 1024)  # MB
        avg_compression = sum(r['compression'] for r in successful) / len(successful)
        avg_final_size = sum(r['final_size'] for r in successful) / len(successful) / 1024  # KB
        
        print("="*60)
        print(f"🎉 WEBP CONVERSION COMPLETE!")
        print(f"⏱️  Total time: {processing_time:.1f} seconds")
        print(f"🚀 Speed: {len(successful)/processing_time:.1f} images/second")
        print(f"✅ Successfully converted: {len(successful)} images")
        print(f"❌ Failed: {len(failed)} images")
        print(f"📊 Average compression: {avg_compression:.1f}% size reduction")
        print(f"📏 Average final size: {avg_final_size:.0f} KB per image")
        print(f"💾 Total size reduction: {total_original:.1f} MB → {total_final:.1f} MB")
        print(f"📂 Output folder: {output_folder}")
        
        if failed:
            print(f"\n❌ Failed files:")
            for fail in failed[:10]:  # Show first 10 failures
                print(f"   • {fail['filename']}: {fail['error']}")
            if len(failed) > 10:
                print(f"   ... and {len(failed) - 10} more failures")
    
    return len(successful), len(failed)

def main():
    print("🚀 FAST MAC IMAGE TO WEBP OPTIMIZER")
    print("📁 Supports nested folders and maintains structure")
    print("="*60)
    
    # Configuration
    print("Available WebP presets:")
    for name, preset in WEBP_PRESETS.items():
        print(f"  {name}: {preset['size']}px, {preset['quality']}% quality - {preset['description']}")
    
    # Get user input
    selected_preset = input(f"\nSelect preset (thumbnail/gallery/display/premium/lossless) [display]: ").strip().lower()
    if selected_preset not in WEBP_PRESETS:
        selected_preset = "display"
    
    config = WEBP_PRESETS[selected_preset]
    print(f"🎯 Selected: {selected_preset} preset")
    
    # Get input folder
    input_folder = input("\nInput folder path (drag & drop or type path): ").strip().strip('"\'')
    if not os.path.exists(input_folder):
        print(f"❌ Folder not found: {input_folder}")
        return
    
    # Create output folder
    folder_name = os.path.basename(input_folder.rstrip('/\\'))
    output_folder = f"{input_folder}_webp_optimized"
    
    # Ask for custom max workers
    max_workers_input = input(f"\nMax CPU cores to use [{max(1, multiprocessing.cpu_count() - 1)}]: ").strip()
    max_workers = None
    if max_workers_input.isdigit():
        max_workers = max(1, min(int(max_workers_input), multiprocessing.cpu_count()))
    
    # Process images
    print(f"\n🔄 Starting WebP conversion...")
    batch_process_nested_folders(input_folder, output_folder, config, max_workers)
    
    print(f"\n🎉 Done! Check your WebP optimized images in:")
    print(f"📂 {output_folder}")
    print(f"\n💡 WebP images are typically 25-50% smaller than JPEG with better quality!")

if __name__ == "__main__":
    main()