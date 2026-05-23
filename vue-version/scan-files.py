#!/usr/bin/env python3
import os
import json
from pathlib import Path
from datetime import datetime

BIJI_DIR = Path(__file__).parent / 'biji'
OUTPUT_FILE = Path(__file__).parent / 'file-list.json'

def scan_directory(directory, parent_path=''):
    items = []
    
    try:
        entries = sorted(directory.iterdir(), key=lambda x: (not x.is_dir(), x.name.lower()))
    except PermissionError:
        return items
    
    for entry in entries:
        if entry.name.startswith('.'):
            continue
            
        relative_path = f"{parent_path}/{entry.name}" if parent_path else entry.name
        
        if entry.is_dir():
            children = scan_directory(entry, relative_path)
            if children:
                items.append({
                    'name': entry.name,
                    'path': relative_path,
                    'isFolder': True,
                    'children': children
                })
        elif entry.suffix.lower() in ['.md', '.markdown']:
            stat = entry.stat()
            items.append({
                'name': entry.name,
                'path': relative_path,
                'isFolder': False,
                'size': stat.st_size,
                'updatedAt': stat.st_mtime
            })
    
    return items

def main():
    print(f"Scanning directory: {BIJI_DIR}")
    
    if not BIJI_DIR.exists():
        print(f"❌ Directory not found: {BIJI_DIR}")
        print(f"   Please create the 'biji' folder and add your markdown files")
        return
    
    tree = scan_directory(BIJI_DIR)
    
    output = {
        'version': '1.0',
        'timestamp': datetime.now().timestamp(),
        'tree': tree
    }
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print(f"✅ File list generated: {OUTPUT_FILE}")
    print(f"📁 Found {len(tree)} top-level items")
    
    file_count = sum(1 for item in tree if not item.get('isFolder'))
    folder_count = sum(1 for item in tree if item.get('isFolder'))
    print(f"   📄 {file_count} files, 📁 {folder_count} folders")

if __name__ == '__main__':
    main()
