import os
import tempfile
import pytest
from PIL import Image
from app.services.validation import validate_artwork

@pytest.fixture
def temp_image():
    # Helper to generate a temp image
    def _create_image(width, height, format="JPEG", size_bytes=None):
        img = Image.new('RGB', (width, height), color='red')
        fd, path = tempfile.mkstemp(suffix=f".{format.lower()}")
        with os.fdopen(fd, 'wb') as f:
            img.save(f, format=format)
        
        # If we need a specific size, pad the file
        if size_bytes:
            with open(path, 'ab') as f:
                current_size = os.path.getsize(path)
                if size_bytes > current_size:
                    f.write(b'\0' * (size_bytes - current_size))
        return path
    
    yield _create_image

def test_validate_artwork_success(temp_image):
    # Thumbnail is 16:9, e.g., 640x360
    path = temp_image(640, 360)
    try:
        is_valid, error, metadata = validate_artwork(path, "thumbnail")
        assert is_valid is True
        assert error is None
        assert metadata["width"] == 640
        assert metadata["height"] == 360
    finally:
        os.remove(path)

def test_validate_artwork_bad_aspect(temp_image):
    # Poster should be 2:3, giving it 1:1
    path = temp_image(500, 500)
    try:
        is_valid, error, metadata = validate_artwork(path, "poster")
        assert is_valid is False
        assert "aspect ratio" in error
    finally:
        os.remove(path)

def test_validate_artwork_too_large(temp_image):
    # > 200KB
    path = temp_image(640, 360, size_bytes=250 * 1024)
    try:
        is_valid, error, metadata = validate_artwork(path, "thumbnail")
        assert is_valid is False
        assert "Maximum allowed size" in error
    finally:
        os.remove(path)
