#!/usr/bin/env python3
"""
split-svg-parts.py — v2.3.0 M1

Splits each per-state SVG in src/assets/cat.js and src/assets/dog.js into
7 bone-aligned parts:
  head, body, tail, backLegLeft, backLegRight, frontLegLeft, frontLegRight

Strategy per state:
  - head: <g class="pet-head"> group, OR (if absent, idle/sleep style) the
    SECOND <g class="anim-breath"> group.
  - body: explicit <g class="pet-body"> if present, OR the FIRST
    <g class="anim-breath"> group, OR leftover after head/tail/legs removed.
  - tail: <path id="cat-tail"> or <path id="dog-tail">.
  - legs: any element with class back-foot-left/right or left-paw/right-paw
    (can be <g> with bone rotation, or simple <ellipse>).

Each part is wrapped in a new <svg viewBox="..."> with the original <defs>,
so PIXI.Texture.from() can load each part independently. Appends a
getCatPartsForState / getDogPartsForState helper to the file.

Idempotent: skips files that already contain the v2.3.0 marker comment.

Usage:
  python scripts/split-svg-parts.py
"""

import re
import sys
from pathlib import Path

VOID_TAGS = {'ellipse', 'circle', 'rect', 'path', 'line', 'polygon',
             'polyline', 'use', 'image', 'stop'}

MARKER = '// === v2.3.0 — PixiJS asset split (M1) ==='


def _find_balanced(svg, open_re, open_prefix, close_tag, after_pos=0):
    """Find a tag matching open_re in svg starting at after_pos, then walk
    forward to find the matching close_tag (handles nested same-tag opens)."""
    m = open_re.search(svg, after_pos)
    if not m:
        return None, -1
    tag = m.group(1)
    is_self_closing = m.group('self') == '/'
    if is_self_closing or tag in VOID_TAGS:
        return m.group(0), m.start()
    pos = m.end()
    depth = 1
    while pos < len(svg) and depth > 0:
        # Find next same-tag open (must be exact, not e.g. <linearGradient
        # when looking for <g>).
        next_open = -1
        scan = pos
        while True:
            cand = svg.find(open_prefix, scan)
            if cand == -1:
                break
            after = cand + len(open_prefix)
            if after < len(svg) and svg[after] in ' \t\n>':
                next_open = cand
                break
            scan = cand + 1
        next_close = svg.find(close_tag, pos)
        if next_close == -1:
            return None, -1
        if next_open != -1 and next_open < next_close:
            depth += 1
            pos = svg.find('>', next_open) + 1
        else:
            depth -= 1
            if depth == 0:
                return svg[m.start():next_close + len(close_tag)], m.start()
            pos = next_close + len(close_tag)
    return None, -1


def find_element_by_class(svg, class_name, after_pos=0):
    pattern = re.compile(
        r'<(\w+)\s[^>]*?\bclass\s*=\s*"([^"]*\b' + re.escape(class_name) +
        r'\b[^"]*)"[^>]*?(?P<self>/)?>',
        re.DOTALL
    )
    open_prefix_cache = {}
    m = pattern.search(svg, after_pos)
    if not m:
        return None, -1
    tag = m.group(1)
    open_prefix = open_prefix_cache.get(tag) or f'<{tag}'
    open_prefix_cache[tag] = open_prefix
    return _find_balanced(svg, pattern, open_prefix, f'</{tag}>', after_pos)


def find_element_by_id(svg, id_name):
    pattern = re.compile(
        r'<(\w+)\s[^>]*?\bid\s*=\s*"' + re.escape(id_name) +
        r'"[^>]*?(?P<self>/)?>',
        re.DOTALL
    )
    open_prefix_cache = {}
    m = pattern.search(svg)
    if not m:
        return None
    tag = m.group(1)
    open_prefix = open_prefix_cache.get(tag) or f'<{tag}'
    open_prefix_cache[tag] = open_prefix
    return _find_balanced(svg, pattern, open_prefix, f'</{tag}>')[0]


def find_defs(svg):
    m = re.search(r'<defs>.*?</defs>', svg, re.DOTALL)
    return m.group(0) if m else ''


def get_viewbox(svg):
    m = re.search(r'viewBox\s*=\s*"([^"]+)"', svg)
    return m.group(1) if m else '0 0 200 200'


def inject_class(element_str, class_to_add):
    """Add class_to_add to the first tag in element_str. Idempotent.
    Operates on character positions in the full element_str, not on a
    re-matched 'attrs' substring (which caused off-by-one in the middle
    of class="...")."""
    # If class attribute already contains class_to_add, no-op.
    m_class = re.search(r'\bclass\s*=\s*"([^"]*)"', element_str)
    if m_class:
        existing = m_class.group(1).split()
        if class_to_add in existing:
            return element_str
        new_value = ' '.join(existing + [class_to_add])
        # Replace just the value (group 1) — preserves the rest of the attribute.
        return (element_str[:m_class.start(1)] + new_value
                + element_str[m_class.end(1):])
    # No class attribute — insert one right after the tag name.
    m_tag = re.search(r'<(\w+)', element_str)
    if not m_tag:
        return element_str
    insert_pos = m_tag.end()
    return (element_str[:insert_pos] + f' class="{class_to_add}"'
            + element_str[insert_pos:])


def split_svg(svg_content):
    """Return (parts_dict, defs_str, viewbox_str)."""
    defs = find_defs(svg_content)
    viewbox = get_viewbox(svg_content)

    # --- Head ---
    head, _ = find_element_by_class(svg_content, 'pet-head')
    if head is None:
        # idle/sleep style: 2 anim-breath groups, second is head
        anim_matches = list(re.finditer(
            r'<g\s[^>]*?\bclass\s*=\s*"[^"]*\banim-breath\b[^"]*"[^>]*?>',
            svg_content
        ))
        if len(anim_matches) >= 2:
            head, _ = find_element_by_class(svg_content, 'anim-breath',
                                            after_pos=anim_matches[1].start())
    original_head = head
    if head:
        head = inject_class(head, 'pet-head')

    # --- Tail ---
    tail = None
    for cand in ('cat-tail', 'dog-tail'):
        if f'id="{cand}"' in svg_content:
            tail = find_element_by_id(svg_content, cand)
            break
    original_tail = tail

    # --- Legs (g or ellipse, both supported via class search) ---
    back_left, _ = find_element_by_class(svg_content, 'back-foot-left')
    back_right, _ = find_element_by_class(svg_content, 'back-foot-right')
    front_left, _ = find_element_by_class(svg_content, 'left-paw')
    front_right, _ = find_element_by_class(svg_content, 'right-paw')
    original_back_left = back_left
    original_back_right = back_right
    original_front_left = front_left
    original_front_right = front_right

    if back_left:
        back_left = inject_class(back_left, 'pet-back-leg-left')
    if back_right:
        back_right = inject_class(back_right, 'pet-back-leg-right')
    if front_left:
        front_left = inject_class(front_left, 'pet-front-leg-left')
    if front_right:
        front_right = inject_class(front_right, 'pet-front-leg-right')

    # --- Body ---
    body, _ = find_element_by_class(svg_content, 'pet-body')
    original_body = body
    if body is None:
        anim_matches = list(re.finditer(
            r'<g\s[^>]*?\bclass\s*=\s*"[^"]*\banim-breath\b[^"]*"[^>]*?>',
            svg_content
        ))
        if anim_matches:
            body, _ = find_element_by_class(svg_content, 'anim-breath',
                                            after_pos=anim_matches[0].start())
            original_body = body
    if body is None:
        # walk/sit style: body is leftover after head/tail/legs removed.
        # Use ORIGINAL element strings (before class injection) so the replace matches.
        leftover = svg_content
        for el in (original_head, original_tail, original_back_left,
                   original_back_right, original_front_left, original_front_right):
            if el:
                leftover = leftover.replace(el, '', 1)
        leftover = re.sub(r'<defs>.*?</defs>', '', leftover, count=1, flags=re.DOTALL)
        leftover = re.sub(r'<!--.*?-->', '', leftover, flags=re.DOTALL)
        leftover = re.sub(r'^<svg[^>]*>', '', leftover.strip(), count=1)
        leftover = re.sub(r'</svg>\s*$', '', leftover.strip(), count=1)
        body = f'<g class="pet-body">{leftover.strip()}</g>'
    else:
        body = inject_class(body, 'pet-body')

    return ({
        'head': head,
        'body': body,
        'tail': tail,
        'backLegLeft': back_left,
        'backLegRight': back_right,
        'frontLegLeft': front_left,
        'frontLegRight': front_right,
    }, defs, viewbox)


def wrap_part(part_content, defs, viewbox):
    if not part_content or not part_content.strip():
        return ''
    return f'<svg viewBox="{viewbox}" xmlns="http://www.w3.org/2000/svg">\n  {defs}\n  {part_content}\n</svg>'


def process_file(file_path, pet):
    content = file_path.read_text(encoding='utf-8')
    if MARKER in content:
        print(f'[{pet}] already split (marker present), skipping')
        return 0

    # Find all `const {pet}XxxSVG = ` ... `;` blocks
    pattern = re.compile(rf'\bconst ({pet}\w+)SVG = `', re.DOTALL)
    matches = list(pattern.finditer(content))
    if not matches:
        print(f'[{pet}] no {pet}XxxSVG constants found, skipping')
        return 0

    appended_strings = []
    frames_for_state = {}  # stateName (lowercase-ish) → [svgName, ...]
    # We'll populate frames later by reading STATE_FRAMES from renderer.js;
    # for now, store all svgName in order.
    all_svg_names = []

    for match in matches:
        const_name = match.group(1)  # e.g., catIdle, catWalk1
        # Extract state name (after pet prefix)
        state_name = const_name[len(pet):]  # 'Idle', 'Walk1', 'Sit', etc.
        start = match.end()
        end_match = re.search(r'`;', content[start:])
        if not end_match:
            print(f'[{pet}] WARNING: no closing backtick for {const_name}, skipping')
            continue
        svg_content = content[start:start + end_match.start()]

        parts, defs, viewbox = split_svg(svg_content)
        all_svg_names.append(state_name)

        for part_name, part_content in parts.items():
            if part_content:
                wrapped = wrap_part(part_content, defs, viewbox)
                camel = part_name[0].upper() + part_name[1:]
                var_name = f'{const_name}{camel}SVG'
                appended_strings.append(f'const {var_name} = `{wrapped}`;')

    # Build helper. Map state names to frames. Heuristic: use the same
    # STATE_FRAMES map the renderer uses; we mirror it here.
    state_to_frames = {
        'idle': ['Idle'],
        'walking': ['Walk1', 'Walk2', 'Walk3', 'Walk4'],
        'sleeping': ['Sleep'],
        'sitting': ['Sit', 'SitBlink'],
        'laying': ['Lay', 'LayBreathe'],
        'stretching': ['Stretch'],
    }
    # Also handle legacy single Walk
    if 'Walk' in all_svg_names and 'Walk1' not in all_svg_names:
        state_to_frames['walking'] = ['Walk']

    helper = []
    helper.append('')
    helper.append(f'function get{pet.capitalize()}PartsForState(state) {{')
    helper.append(f'  // state: lowercase ("idle", "walking", "sleeping", "sitting", "laying", "stretching")')
    helper.append(f'  // Returns array of part-dicts (one per frame). Each part is an SVG string')
    helper.append(f'  // ready for PIXI.Texture.from(). Missing parts are null.')
    helper.append(f'  const STATE_TO_FRAMES = {{')
    for state, names in state_to_frames.items():
        helper.append(f'    {state}: {names!r},')
    helper.append(f'  }};')
    helper.append(f'  const frames = STATE_TO_FRAMES[state] || [];')
    helper.append(f'  return frames.map(name => ({{')
    for part_name in ('head', 'body', 'tail', 'backLegLeft', 'backLegRight',
                      'frontLegLeft', 'frontLegRight'):
        camel = part_name[0].upper() + part_name[1:]
        helper.append(f'    {part_name}: window["{pet}" + name + "{camel}SVG"] || null,')
    helper.append(f'  }}));')
    helper.append(f'}}')
    helper.append(f'window.get{pet.capitalize()}PartsForState = get{pet.capitalize()}PartsForState;')
    helper.append('')

    # Append marker + parts + window assignments + helper
    new_content = content.rstrip() + '\n\n'
    new_content += MARKER + '\n'
    new_content += '// Auto-generated by scripts/split-svg-parts.py — do not edit by hand.\n'
    new_content += '// To regenerate: delete this block and re-run the script.\n'
    for s in appended_strings:
        new_content += s + '\n'
    # Expose all per-part constants to window (browser). `const` at top level
    # of a <script> tag is NOT auto-assigned to window (unlike `var`). The
    # helper getXxxPartsForState resolves them via window[...] so we need
    # explicit assignments — mirror the pattern the original SVGs use.
    new_content += '\n// Expose all per-part constants to window (browser).\n'
    for s in appended_strings:
        m = re.match(r'const (\w+)\s*=', s)
        if m:
            new_content += f'window.{m.group(1)} = {m.group(1)};\n'
    new_content += '\n' + '\n'.join(helper) + '\n'

    file_path.write_text(new_content, encoding='utf-8')
    print(f'[{pet}] processed {len(matches)} states, appended {len(appended_strings)} part strings')
    return len(appended_strings)


def main():
    src_dir = Path(__file__).parent.parent / 'src' / 'assets'
    total = 0
    for pet in ('cat', 'dog'):
        file_path = src_dir / f'{pet}.js'
        if not file_path.exists():
            print(f'[{pet}] file not found, skipping')
            continue
        total += process_file(file_path, pet)
    print(f'Total appended: {total} part strings')


if __name__ == '__main__':
    main()
