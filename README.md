# streamtv

## install
npm i

## test
npm test

## build
npm run build

## run (shows help)
node lib/src/index.js

### Stores whole joj.sk archive with all the programmes details (takes a long time)
node lib/src/index.js -fcvh www.joj.sk

### Stores https://www.joj.sk program archive list in cache and compiles archive json for given program
node lib/src/index.js -fcvp https://www.joj.sk/15-min-kuchar -h www.joj.sk

### Stores all programmes with title starting with given regexp (takes usually long time) 
node lib/src/index.js -fvx ^a.* -h www.joj.sk