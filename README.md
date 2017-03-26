# _MalScraper_

At the moment, _MalScraper_ is able to:
* Gather information about all the anime being releases in a season
* Gather anime-related news (include light-novels, manga, films...). 300 news available.
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
  
// Get seasonal information 
let seasonalInfo = malScraper.getSeason(2016, 'fall', () => {
    console.log("Finished gathering information.")
})
```
```javascript
//Want stats for this season ? 
console.log(seasonalInfo.stats)
/* 
    { TVNumber: 151,
      ONANumber: 10,
      OVANumber: 32,
      MovieNumber: 24,
      SpecialNumber: 14 }
 */
  
// All the anime of this season along with their information are
// in seasonalInfo.info
console.log(seasonalInfo.info)
```

seasonalInfo.info is ordered in this way :
1. TV
2. ONA
3. OVA
4. Movie
5. Special
```javascript
// So the last TV anime type is at
let lastTVAnime = seasonalInfo.info[seasonalInfo.stats.TVNumber - 1]
```
   
```javascript
// Want Anime related news ? (Include light novels, mangas, films...)
let news = malScraper.getNewsNoDetails( () => {
    console.log('Finished gathering the news.')
})
  
// A news object is like this: 
console.log(news)
  
// One news can be seen with 
console.log(news[index])    // index in 0, 300 
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
