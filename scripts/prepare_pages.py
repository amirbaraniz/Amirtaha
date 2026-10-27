#!/usr/bin/env python3
"""Prepare static artifact metadata for GitHub Pages (stdlib only)."""
import argparse
from pathlib import Path
from urllib.parse import urlparse

parser = argparse.ArgumentParser()
parser.add_argument('--site-url', required=True, help='https://username.github.io/repository/')
parser.add_argument('--directory', required=True)
args = parser.parse_args()
root = Path(args.directory).resolve()
site_url = args.site_url.rstrip('/') + '/'
parsed = urlparse(site_url)
if parsed.scheme != 'https' or not parsed.netloc or '..' in parsed.path.split('/'):
    raise SystemExit('Invalid --site-url')
for path in root.rglob('*'):
    if path.is_file() and path.suffix.lower() in ('.html','.xml','.txt'):
        s = path.read_text(encoding='utf-8')
        if 'https://example.com/' in s:
            path.write_text(s.replace('https://example.com/', site_url), encoding='utf-8')
print('GitHub Pages static metadata:', site_url)
