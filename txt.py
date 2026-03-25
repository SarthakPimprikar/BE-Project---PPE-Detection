import os

ROOT_DIR = os.getcwd()
OUTPUT_FILE = os.path.join(ROOT_DIR, "ui_code.txt")

ALLOWED_EXTENSIONS = {
    ".html", ".css", ".js", ".py"
    ".json", 
    ".jsx",
    ".ts",
    ".tsx",
    ".scss",
    ".sass",
    # ".txt",
    # ".md", ".env", ".yml", ".yaml"
}

EXCLUDE_DIRS = {
    "__pycache__", ".git", "venv", "env",
    "node_modules", ".idea", ".vscode",
    "dist", "build", ".mypy_cache"
}

def should_include_file(file_path):
    _, ext = os.path.splitext(file_path)
    return ext.lower() in ALLOWED_EXTENSIONS

def is_excluded(path):
    parts = path.split(os.sep)
    return any(part in EXCLUDE_DIRS for part in parts)

def generate_structure():
    with open(OUTPUT_FILE, "w", encoding="utf-8") as output:
        for root, dirs, files in os.walk(ROOT_DIR):
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
            for file in files:
                full_path = os.path.join(root, file)
                if full_path == OUTPUT_FILE:
                    continue
                if is_excluded(full_path):
                    continue
                if should_include_file(full_path):
                    relative_path = os.path.relpath(full_path, ROOT_DIR)
                    output.write(f"#{relative_path}\n")
                    try:
                        with open(full_path, "r", encoding="utf-8", errors="ignore") as f:
                            content = f.read()
                            output.write(content)
                    except:
                        pass
                    output.write("\n\n")

if __name__ == "__main__":
    generate_structure()
    print("ui_code.txt generated successfully.")