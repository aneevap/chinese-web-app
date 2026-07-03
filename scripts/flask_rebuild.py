#!/usr/bin/env python3
"""Clean rebuild of laboratory-playground.html JS section to fix all corruption."""

import re

path = '/Users/gu2026/Desktop/chinese-web-app/laboratory-playground.html'

with open(path, 'r') as f:
    content = f.read()

# Split into parts
script_start = content.find('<script>')
script_end = content.find('</script>', script_start)

if script_start < 0 or script_end < 0:
    print("ERROR: no script tags")
    exit(1)

html_part = content[:script_start + len('<script>') + 1]  # include \n after <script>
js_part = content[script_start + len('<script>'):script_end]
rest_part = content[script_end:]

# Strategy: Extract each unique function by finding its definition and keeping only the first occurrence
# Then rebuild the JS in the correct order

# Find the actual start of the JS (after the header comment)
js_start_marker = 'var Lab = {};'
js_idx = js_part.find(js_start_marker)
if js_idx < 0:
    print("ERROR: var Lab not found in JS")
    exit(1)

# Everything before var Lab is the header comment - keep it
header = js_part[:js_idx + len(js_start_marker)]

# Now extract only unique function definitions in the correct order
# We'll find each function by its pattern "Lab.X = function" or "function X"
# and keep only the first occurrence

# Define the functions we need, in order
needed_functions = [
    # Sound effects
    ('Lab.sfx =', 'Lab.sfx ='),
    # State
    ('Lab.state = {', 'Lab.state = {'),
    # Init
    ('Lab.init = function', 'Lab.init = function'),
    # Triple blend
    ('Lab.updateBlendToggle = function', 'Lab.updateBlendToggle = function'),
    ('Lab.setBlendMode = function', 'Lab.setBlendMode = function'),
    # Course data
    ('Lab.loadCourseData = function', 'Lab.loadCourseData = function'),
    ('Lab.getCharMastery = function', 'Lab.getCharMastery = function'),
    # Tab switching
    ('Lab.switchTab = function', 'Lab.switchTab = function'),
    # Topbar
    ('Lab.updateTopbar = function', 'Lab.updateTopbar = function'),
    # Radical picker
    ('Lab.renderRadicalPicker = function', 'Lab.renderRadicalPicker = function'),
    ('Lab.selectRadicalForMix = function', 'Lab.selectRadicalForMix = function'),
    # Beakers/flask
    ('Lab.updateBeakers = function', 'Lab.updateBeakers = function'),
    ('Lab.updateAffinityHints = function', 'Lab.updateAffinityHints = function'),
    # Click handlers
    ('function onBeakerClick', 'function onBeakerClick'),
    ('function clearMixSelection', 'function clearMixSelection'),
    # Mix action
    ('function onMixClick', 'function onMixClick'),
    # Toast
    ('Lab.showResultToast = function', 'Lab.showResultToast = function'),
    ('Lab.showToast = function', 'Lab.showToast = function'),
    ('function closeResultToast', 'function closeResultToast'),
    # Synthesis
    ('Lab.startSynthesis = function', 'Lab.startSynthesis = function'),
    ('Lab.exitSynthesis = function', 'Lab.exitSynthesis = function'),
    ('function onExtendClick', 'function onExtendClick'),
    ('Lab.showChainResultToast = function', 'Lab.showChainResultToast = function'),
    # Flask helpers
    ('function getCategoryColor', 'function getCategoryColor'),
    ('function updateFlaskLiquid', 'function updateFlaskLiquid'),
    ('function clearFlaskLiquid', 'function clearFlaskLiquid'),
    ('function showFlaskResult', 'function showFlaskResult'),
    ('function hideFlaskResult', 'function hideFlaskResult'),
    ('function shakeFlask', 'function shakeFlask'),
    # Decomposition
    ('Lab.renderDecompList = function', 'Lab.renderDecompList = function'),
    ('Lab.selectDecompChar = function', 'Lab.selectDecompChar = function'),
    ('function clearDecompSelection', 'function clearDecompSelection'),
    ('function onDecomposeClick', 'function onDecomposeClick'),
    # Stats
    ('Lab.renderStats = function', 'Lab.renderStats = function'),
    # Branching
    ('Lab.checkBranching = function', 'Lab.checkBranching = function'),
    ('Lab.renderBranchingModal = function', 'Lab.renderBranchingModal = function'),
    ('Lab.closeBranchingModal = function', 'Lab.closeBranchingModal = function'),
    # Collection/discovered
    ('Lab.renderCollection = function', 'Lab.renderCollection = function'),
    ('Lab.renderDiscovered = function', 'Lab.renderDiscovered = function'),
    # Helpers
    ('Lab.getRadicalInfo = function', 'Lab.getRadicalInfo = function'),
    ('Lab.getCategoryMeta = function', 'Lab.getCategoryMeta = function'),
    ('function setCollFilter', 'function setCollFilter'),
    ('function setCollCategory', 'function setCollCategory'),
    ('Lab.closeBranchingModal = function', 'Lab.closeBranchingModal = function'),
]

# Collect unique function bodies
def extract_function_body(text, start_marker):
    """Find a function definition and extract its full body."""
    idx = text.find(start_marker)
    if idx < 0:
        return None, -1
    
    # Find the full function body by counting braces
    # Look for the next { after the marker
    brace_idx = text.find('{', idx)
    if brace_idx < 0:
        return None, -1
    
    depth = 0
    i = brace_idx
    while i < len(text):
        if text[i] == '{':
            depth += 1
        elif text[i] == '}':
            depth -= 1
            if depth == 0:
                # Return function body including the closing };
                # Check if there's a semicolon after }
                i += 1  # include the }
                return text[idx:i], i
        i += 1
    
    return None, -1

# Since the file has duplicated content, let me find and use only the LAST occurrence 
# of each function (usually the most complete/correct one)

built_js = header + '\n'

# First, let's find unique section markers (the LAB ENGINE header)
# and extract everything from the last occurrence of each function

# Actually, let me try a different approach: find each function by its definition,
# and extract only the last occurrence (should be the cleanest one)

for fn_name, fn_marker in needed_functions:
    # Find all occurrences
    idx = 0
    last_body = None
    last_end = 0
    count = 0
    
    while True:
        found_idx = js_part.find(fn_marker, idx)
        if found_idx < 0:
            break
        body, end = extract_function_body(js_part, fn_marker)
        if body:
            last_body = body
            last_end = end
            count += 1
        idx = found_idx + len(fn_marker)
    
    if last_body:
        built_js += last_body + '\n\n'
        print(f'  {fn_name}: {count} occurrences, kept last one')
    else:
        print(f'  {fn_name}: NOT FOUND')

# Now replace the JS part and save
content = html_part + '\n' + built_js + '\n' + rest_part

with open(path, 'w') as f:
    f.write(content)

print(f'\nDone! New file size: {len(content)} chars')
print(f'JS section: {len(built_js)} chars')
