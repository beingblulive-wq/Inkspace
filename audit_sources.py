import os
import hashlib

def get_file_hash(file_path):
    hasher = hashlib.md5()
    with open(file_path, 'rb') as f:
        buf = f.read()
        hasher.update(buf)
    return hasher.hexdigest()

def find_duplicates(directory):
    hashes = {}
    duplicates = []
    
    for root, dirs, files in os.walk(directory):
        for filename in files:
            # Checking all files in assets to be thorough
            path = os.path.join(root, filename)
            file_hash = get_file_hash(path)
            
            if file_hash in hashes:
                duplicates.append((path, hashes[file_hash]))
            else:
                hashes[file_hash] = path
    return duplicates

if __name__ == "__main__":
    # We are checking your assets folder specifically
    folder_to_check = "./assets" 
    print(f"--- Auditing HAI-Tech LLC Source Files in {folder_to_check} ---")
    
    if not os.path.exists(folder_to_check):
        print(f"Error: {folder_to_check} folder not found!")
    else:
        dupes = find_duplicates(folder_to_check)
        if not dupes:
            print("No duplicates found. Your local architecture is clean.")
        else:
            print(f"Found {len(dupes)} duplicate sets:")
            for dupe, original in dupes:
                print(f"DUPLICATE: {dupe}\nORIGINAL: {original}\n---")