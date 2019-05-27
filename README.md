# streamtv

## install
npm i

## test
npm test

## build
npm run build

## run (shows help)
node lib/index.js

### Stores whole joj.sk archive with all the programmes details (takes a long time)
node lib/index.js -f -c -v

### Stores https://www.joj.sk program archive list in cache and compiles archive json for given program
node lib/index.js -v -c -f -p https://www.joj.sk/profesionali

### Stores all programmes with title starting with given regexp (takes usually long time) in fetch sequence mode 
node lib/index.js -f -v -x ^a.* -s