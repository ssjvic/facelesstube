import os, re

def check_imports(dir_path):
    issues = []
    # Create a map of lowercase path to actual case path for all files
    actual_files = {}
    for root, dirs, files in os.walk(dir_path):
        for f in files:
            full_path = os.path.join(root, f)
            actual_files[full_path.lower()] = full_path

    # Check each js/jsx file
    import_re = re.compile(r'(?:import|from)\s+[\'"]([\.][^\'"]+)[\'"]')
    for root, dirs, files in os.walk(dir_path):
        for f in files:
            if not f.endswith(('.js', '.jsx', '.ts', '.tsx')):
                continue
            file_path = os.path.join(root, f)
            try:
                with open(file_path, 'r', encoding='utf-8') as file:
                    content = file.read()
                    imports = import_re.findall(content)
                    for imp in imports:
                        # Resolve the imported path
                        dir_name = os.path.dirname(file_path)
                        imp_path = os.path.normpath(os.path.join(dir_name, imp))
                        
                        # Add suffixes to check
                        possible_paths = [
                            imp_path,
                            imp_path + '.js',
                            imp_path + '.jsx',
                            os.path.join(imp_path, 'index.js'),
                            os.path.join(imp_path, 'index.jsx')
                        ]
                        
                        found = False
                        for p in possible_paths:
                            if p.lower() in actual_files:
                                if actual_files[p.lower()] != p:
                                    # Normalize slashes for comparison
                                    actual = actual_files[p.lower()].replace('\\', '/')
                                    requested = p.replace('\\', '/')
                                    if actual != requested:
                                        issues.append(f"Case mismatch in {file_path}: imported '{imp}' resolves to {actual} but requested {requested}")
                                found = True
                                break
                        # If not found but it's relative, it might be a missing file or another type like .svg, .css
                        if not found and not any(imp.endswith(ext) for ext in ['.svg', '.css', '.png', '.jpg', '.jpeg', '.mp3', '.json']):
                             issues.append(f"Missing or unresolvable import in {file_path}: {imp} (looked for {imp_path})")
            except Exception as e:
                pass
    return issues

issues = check_imports('src')
print("=== ISSUES ===")
for i in issues:
    print(i)
print("=== DONE ===")
