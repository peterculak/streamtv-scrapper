# streamtv

## install
npm i
cp .config/example.yml .config/config.yml

## test
npm test

## test in docker container
docker-compose -f docker-compose.yml -f docker-compose-tests.yml up

## build
npm run build

## run (shows help)
node lib/src/index.js

## pulls news
npm run news

## pulls shows and series
npm run shows

### Stores whole joj.sk archive with all the programmes details (takes a long time)
node lib/src/index.js -fcvh www.joj.sk

### Stores https://www.joj.sk program archive list in cache and compiles archive json for given program
node lib/src/index.js -fcvp https://www.joj.sk/15-min-kuchar -h www.joj.sk

### Stores all programmes with title starting with given regexp (takes usually long time) 
node lib/src/index.js -fvx ^a.* -h www.joj.sk

## Create encrypted archive from pulled news and shows
npm run encrypt

# Fetch some shows in DEV locally without having to build and deploy
```
ts-node src/index.ts -va shows
```
# Encrypt shows in DEV locally without having to build and deploy
```
ts-node src/index.ts -va encrypt
```