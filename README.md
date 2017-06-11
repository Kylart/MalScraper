# _MalScraper_

At the moment, _MalScraper_ is able to:
* Gather information about all the anime being releases in a season
* Gather anime-related news (include light-novels, manga, films...). 200 news available.
* Make an anime search.
* Get different information for this anime.
* Get only the best result for an anime search.

_MalScraper_ is being developed mainly for [_KawAnime_](https://github.com/Kylart/KawAnime) but anyone can use it for
 its own purpose.

Any contribution is welcomed.

## Installation
    npm install --save mal-scraper

## Use
```javascript
const malScraper = require('mal-scraper')
  
const year = 2017
// Season can only be 'spring', 'summer', 'fall' or 'winter'.
const season = 'spring' 
  
// Get seasonal information 
malScraper.getSeason(2017, 'spring').then((result) => {
  const TV = result.info.TV
  const OVAs = result.info.OVAs
  const Movies = result.info.Movies
  
  const stats = result.stats
}).catch((err) => {
  console.log(err)
})
```

One anime is structured this way: 
```
{ 
  title: 'Boku no Hero Academia OVA',
  jpTitle: '僕のヒーローアカデミア OVA',
  genres: [ 'Action', 'Adventure', 'Comedy', 'Shounen', 'Supernatural' ],
  picture: 'https://s.livechart.me/anime/poster_images/2292/bca148c0a1a65c244a62b997d16e0cb20344503d.jpg',
  synopsis: 'OVAs bundled with the 13th and 14th compiled book volumes.',
  producers: [ 'Bones' ],
  releaseDate: 'April 4, 2017 JST',
  nbEp: '',
  fromType: '' 
}
```

And stats is this way: 
```
{ TVNumber: 64, OVANumber: 42, MovieNumber: 37 }
```
   
```javascript
// Want Anime related news ? (Include light novels, mangas, films...)
malScraper.getNewsNoDetails.then((data) => {
  console.log(data)
  // => 160 elements
}).catch((err) => {
  console.error(err)
})
  
// A news object is like this: 
console.log(news)
  
// One news can be seen with 
console.log(news[index])    // index in 0, 200 
```

```javascript
// Want info about any anime ? 
// Is a bit slower than getInfoFromURI but gives more info...
const name = 'Sakura Trick'
 
malScraper.getInfoFromName(name).then((anime) => {
  console.log(anime)
}).catch((err) => {
  console.log(err)
})

```

```javascript
// Want to search for results for anime research ?
malScraper.getResultsFromSearch('Youjo Senki').then((items) => {
  console.log(items)
}).catch((err) => {
  console.log(`An error occured: ${err}.`)
})
 
// Or maybe you want the best result for this research ?
const name = 'Youjo Senki'
 
malScraper.getResultsFromSearch(name).then((items) => {
  console.log(malScraper.getBestMatch(name, items))
}).catch((err) => {
  console.log(`An error occured: ${err}.`)
})
 
// Or maybe you want more information about this anime? like its description?
const name = 'Youjo Senki'
 
malScraper.getResultsFromSearch(name).then((items) => {
  return malScraper.getInfoFromURI(malScraper.getBestMatch(name, items))
}).then((item) => {
  console.log(item)
}).catch((err) => {
  console.log(`An error occured: ${err}.`)
})
```

## Contributing
1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request.

## License
MIT License

Copyright (c) Kylart
