import os
import shutil
from typing import Protocol

class StorageBackend(Protocol):
    def save(self, file_path: str, destination_key: str) -> str:
        """Saves a file to the storage backend and returns its URI or key."""
        ...
        
    def get_url(self, storage_key: str) -> str:
        """Gets a public URL for a storage key."""
        ...

class LocalStorage:
    def __init__(self, base_path: str = "assets", base_url: str = "/assets"):
        self.base_path = base_path
        self.base_url = base_url
        os.makedirs(self.base_path, exist_ok=True)
        
    def save(self, file_path: str, destination_key: str) -> str:
        dest_path = os.path.join(self.base_path, destination_key)
        os.makedirs(os.path.dirname(dest_path), exist_ok=True)
        shutil.copy2(file_path, dest_path)
        return destination_key
        
    def get_url(self, storage_key: str) -> str:
        return f"{self.base_url}/{storage_key}"

def get_storage() -> StorageBackend:
    # Later this can read from settings to choose R2 vs Local
    root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    assets_dir = os.path.join(root_dir, "assets")
    return LocalStorage(base_path=assets_dir)
