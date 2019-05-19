# streamtv

## install
npm i

## build
npm run build

## run (shows help)
node lib/index.js

### Stores https://www.joj.sk archive index in cache and prints pretty logs in console
node lib/index.js -s joj -vvv | ./node_modules/pino-pretty/bin.js

### Stores https://www.joj.sk program archive list in cache and compiles archive json for given program
node lib/index.js -v -c -f -p https://www.joj.sk/profesionali

### Stores whole joj.sk archive with all the programmes details (takes a long time)
node lib/index.js -f -c -v

### Stores all programmes with title starting with given regexp (takes usually long time)
node lib/index.js -f -v -x ^a.*