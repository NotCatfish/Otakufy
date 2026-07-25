import os
import shutil
import re

ROOT_DIR = r"C:\Users\lenovo\Desktop\otakufy"
FEATURES_DIR = os.path.join(ROOT_DIR, "features")
WEB_SRC_DIR = os.path.join(ROOT_DIR, "web", "src")
NEW_FEATURES_DIR = os.path.join(WEB_SRC_DIR, "features")

def migrate():
    # 1. Move the folder
    if os.path.exists(FEATURES_DIR):
        print(f"Moving {FEATURES_DIR} to {NEW_FEATURES_DIR}")
        shutil.move(FEATURES_DIR, NEW_FEATURES_DIR)
    elif os.path.exists(NEW_FEATURES_DIR):
        print("Features directory already moved.")
    else:
        print("Features directory not found at all!")
        return

    # 2. Update imports across all .js, .jsx, .ts, .tsx in web/src (which now includes features)
    for root, dirs, files in os.walk(WEB_SRC_DIR):
        for file in files:
            if file.endswith(('.js', '.jsx', '.ts', '.tsx', '.css')):
                filepath = os.path.join(root, file)
                
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()

                new_content = content
                
                if file.endswith('.css'):
                    # Fix globals.css @source
                    new_content = re.sub(r'@source\s+["\'].*features["\'];', '@source "../features";', new_content)
                else:
                    # Fix imports of features
                    # Matches from '.../features/...' or from ".../features/..."
                    new_content = re.sub(r'from\s+[\'"](\.\./)+features/([^\'"]+)[\'"]', r"from '@/features/\2'", new_content)
                    new_content = re.sub(r'import\s+[\'"](\.\./)+features/([^\'"]+)[\'"]', r"import '@/features/\2'", new_content)
                    
                    # Fix imports of web/src
                    new_content = re.sub(r'from\s+[\'"](\.\./)+web/src/([^\'"]+)[\'"]', r"from '@/\2'", new_content)
                    new_content = re.sub(r'import\s+[\'"](\.\./)+web/src/([^\'"]+)[\'"]', r"import '@/\2'", new_content)
                
                if new_content != content:
                    print(f"Updated imports in {filepath}")
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)

if __name__ == "__main__":
    migrate()
