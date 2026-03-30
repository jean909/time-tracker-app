#!/usr/bin/env python3
"""
Simple script to generate PWA icons from SVG base icon.
Run: python generate-icons.py
"""

import os

# SVG icon content - simple clock/time icon
svg_content = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#22c55e;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0ea5e9;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="20" fill="url(#bg)"/>
  <circle cx="50" cy="50" r="35" fill="none" stroke="white" stroke-width="3"/>
  <line x1="50" y1="50" x2="50" y2="25" stroke="white" stroke-width="3" stroke-linecap="round"/>
  <line x1="50" y1="50" x2="65" y2="50" stroke="white" stroke-width="2" stroke-linecap="round"/>
  <circle cx="50" cy="50" r="3" fill="white"/>
  <text x="50" y="85" text-anchor="middle" fill="white" font-family="Arial" font-size="8" font-weight="bold">TIME</text>
</svg>'''

sizes = [72, 96, 128, 144, 152, 192, 384, 512]

# Write the base SVG
with open('icon-base.svg', 'w') as f:
    f.write(svg_content)

print("Base SVG icon created: icon-base.svg")
print("To generate PNG icons, install Inkscape or use an online SVG to PNG converter:")
print("Required sizes:", sizes)
print("Example command with Inkscape:")
for size in sizes:
    print(f"  inkscape --export-type=png --export-width={size} --export-filename=icon-{size}x{size}.png icon-base.svg")