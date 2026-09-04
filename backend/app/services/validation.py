import os
from PIL import Image
from typing import Tuple, Optional

# Reference specs
ARTWORK_SPECS = {
    "poster": {
        "aspect": "2:3",
        "target_px": [600, 900],
        "max_kb": 200
    },
    "banner": {
        "aspect": "16:9",
        "target_px": [1280, 720],
        "max_kb": 200
    },
    "thumbnail": {
        "aspect": "16:9",
        "target_px": [640, 360],
        "max_kb": 200
    }
}

def _parse_aspect(aspect_str: str) -> float:
    w, h = aspect_str.split(':')
    return float(w) / float(h)

def validate_artwork(file_path: str, artwork_type: str) -> Tuple[bool, Optional[str], Optional[dict]]:
    if artwork_type not in ARTWORK_SPECS:
        return False, f"Unknown artwork type: {artwork_type}", None
        
    spec = ARTWORK_SPECS[artwork_type]
    file_size_bytes = os.path.getsize(file_path)
    file_size_kb = file_size_bytes / 1024
    
    if file_size_kb > spec["max_kb"]:
        return False, f"{artwork_type.capitalize()} image is {int(file_size_kb)} KB. Maximum allowed size is {spec['max_kb']} KB.", None

    try:
        with Image.open(file_path) as img:
            img.verify() # verify it's an image
    except Exception:
        return False, "File is not a valid image.", None

    try:
        with Image.open(file_path) as img:
            width, height = img.size
            content_type = img.format.lower() if img.format else "unknown"
            
            aspect_target = _parse_aspect(spec["aspect"])
            aspect_actual = width / height
            
            # Allow small float variations due to rounding
            if abs(aspect_actual - aspect_target) > 0.05:
                return False, f"{artwork_type.capitalize()} must use a {spec['aspect']} aspect ratio. Image provided has dimensions {width}x{height}.", None
                
            target_w, target_h = spec["target_px"]
            min_w, max_w = target_w * 0.9, target_w * 1.1
            min_h, max_h = target_h * 0.9, target_h * 1.1
            
            if not (min_w <= width <= max_w and min_h <= height <= max_h):
                return False, f"{artwork_type.capitalize()} dimensions must be approximately {target_w}x{target_h}. Image provided has dimensions {width}x{height}.", None
            
            metadata = {
                "width": width,
                "height": height,
                "file_size_bytes": file_size_bytes,
                "content_type": content_type
            }
            return True, None, metadata
            
    except Exception as e:
        return False, f"Error processing image: {str(e)}", None
