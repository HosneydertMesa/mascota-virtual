#!/usr/bin/env python3
"""Add class="pet-head" to all head groups in cat.js and dog.js.

A head group is the <g> that contains the head circle (r=30 for cat, r=32 for dog).
We add class="pet-head" to that <g> so renderer.js can target it for look-at-cursor
rotation.
"""
import re
from pathlib import Path

FILES = [
    Path(r"C:/Users/HOSNE/OneDrive/Desktop/mascotaVirtual/src/assets/cat.js"),
    Path(r"C:/Users/HOSNE/OneDrive/Desktop/mascotaVirtual/src/assets/dog.js"),
]

# Match: <g style="transform-origin: WHATEVER;"> that contains a circle with
# r="30" (cat) or r="32" (dog) and fill="url(#cat-skin)" or fill="url(#dog-skin)".
# The head group is the one with the head base circle (the largest one).

# Pattern: <g style="transform-origin: ...;"> followed by content that includes
# <circle cx="..." cy="..." r="30" fill="url(#cat-skin)" /> (cat)
# or <circle cx="..." cy="..." r="30" fill="url(#dog-skin)" /> (dog has r=30 too, actually).
#
# Wait, dog has r=32 for head? Let me just use the head pattern from the existing code.
# Cat: <circle cx="..." cy="..." r="30" fill="url(#cat-skin)" />
# Dog: <circle cx="..." cy="..." r="30" fill="url(#dog-skin)" /> — actually dog has r=30 too,
#       but some have r="32" (sit). Just use r="30" or r="32" inside.
# Most reliable: find <g style="transform-origin: ..."> where the first big circle is the head.
#
# Simple approach: find the <g style="transform-origin: ...>"> that is the LAST <g> in each
# walk frame and contains the eyes/nose/mouth, AND add class="pet-head" if it doesn't have it.

# Better approach: search for `<g style="transform-origin: 55px 80px;">` (the walk head)
# and similar head group markers. The head group is the one with the head circle.
#
# Most pragmatic: search for the unique head circle pattern, then walk up to find the
# parent <g style="transform-origin: ..."> and add class to it.

def add_pet_head_class(text):
    """Find every <g style="transform-origin: ...;"> that contains a head circle (r=30/32
    with skin fill) and add class="pet-head" if not already present.
    """
    # Find every <g ...> ... </g> block (non-greedy until matching close).
    # The head group pattern: <g style="transform-origin: Xpx Ypx;"> where the content
    # has a circle with r=30 (or 32) and skin fill.
    # The challenge: nested <g> tags inside. We need to find the OUTER <g> for the head.

    # Simpler heuristic: find every <g style="transform-origin: Xpx Ypx;"> and check if
    # its content (until matching </g>) contains <circle ... r="30" ... fill="url(#cat-skin)">.
    # If yes, add class="pet-head" to the <g>.

    head_marker_pattern = re.compile(
        r'<g\s+style="transform-origin:\s*([\d.]+)px\s+([\d.]+)px;">',
        re.IGNORECASE
    )

    # For each match, find the closing </g> by tracking nesting.
    # A <g> tag in the same content. This is non-trivial without a real parser.

    # Alternative: use a state machine that tracks <g> nesting.
    result = []
    i = 0
    added = 0
    text_len = len(text)
    while i < text_len:
        m = head_marker_pattern.search(text, i)
        if not m:
            result.append(text[i:])
            break
        # Append text before the match
        result.append(text[i:m.start()])
        # The opening <g style="...">
        g_open = m.group(0)
        # Find the matching </g>
        depth = 1
        j = m.end()
        # Track <g> and </g> tags
        g_open_simple = re.compile(r'<g[\s>]', re.IGNORECASE)
        g_close = re.compile(r'</g>', re.IGNORECASE)
        while depth > 0 and j < text_len:
            next_open = g_open_simple.search(text, j)
            next_close = g_close.search(text, j)
            if not next_close:
                break  # malformed
            if next_open and next_open.start() < next_close.start():
                depth += 1
                j = next_open.end()
            else:
                depth -= 1
                j = next_close.end()
        g_content = text[m.end():j]
        # Check if content has head circle (r=30 or 32 with skin fill)
        has_head_circle = bool(re.search(
            r'<circle[^>]*r="(?:26|28|30|32|42|44)"[^>]*fill="url\(#(?:cat-skin|dog-skin)\)"',
            g_content
        ))
        if has_head_circle:
            # Add class="pet-head" to the <g> tag
            if 'class="pet-head"' not in g_open:
                new_g_open = g_open.replace('<g ', '<g class="pet-head" ', 1)
                result.append(new_g_open)
                added += 1
            else:
                result.append(g_open)
        else:
            result.append(g_open)
        result.append(g_content)
        i = j
    return ''.join(result), added


def main():
    total_added = 0
    for f in FILES:
        text = f.read_text(encoding='utf-8')
        new_text, added = add_pet_head_class(text)
        f.write_text(new_text, encoding='utf-8')
        print(f"{f.name}: added {added} pet-head classes")
        total_added += added
    print(f"Total: {total_added}")


if __name__ == "__main__":
    main()
