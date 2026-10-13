#!/bin/sh
# Builds web/vendor/three.bundle.js: a minified IIFE with only the three.js
# classes listed in scripts/three-entry.js, exposed as window.THREE.
# Usage: npm install && sh scripts/build-three.sh
set -eu
cd "$(dirname "$0")/.."
VERSION=$(node -p "require('./node_modules/three/package.json').version")
LICENSE_TEXT=$(sed 's/^/ * /' node_modules/three/LICENSE)
BANNER="/*!
 * three.js v${VERSION} (subset bundle for stretchbud) - https://threejs.org
${LICENSE_TEXT}
 */"
mkdir -p web/vendor
npx esbuild scripts/three-entry.js \
  --bundle --minify --format=iife --target=safari15 \
  --legal-comments=none \
  --banner:js="$BANNER" \
  --outfile=web/vendor/three.bundle.js
ls -l web/vendor/three.bundle.js
gzip -c web/vendor/three.bundle.js | wc -c | awk '{print "gzip bytes: " $1}'
