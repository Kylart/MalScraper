<h1 align="center">MalScraper</h1>

<p align="center">
  <a href="http://forthebadge.com/" target="_blank">
    <img src="http://forthebadge.com/images/badges/built-with-love.svg"/>
  </a>
</p>

<p align="center">
  <a href="https://standardjs.com/" target="_blank">
    <img src="https://cdn.rawgit.com/feross/standard/master/badge.svg" />
  </a>
</p>

<p align="center">
  <a href="https://travis-ci.org/Kylart/MalScraper" target="_blank">
    <img src="https://travis-ci.org/Kylart/MalScraper.svg?branch=master" alt="Build Status">
  </a>
  <a href="https://codecov.io/gh/Kylart/MalScraper" target="_blank">
    <img src="https://codecov.io/gh/Kylart/MalScraper/branch/master/graph/badge.svg" alt="Codecov" />
  </a>
  <a href="https://opensource.org/licenses/MIT" target="_blank">
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License">
  </a>
</p>

At the moment, _MalScraper_ allows one to:
* Gather information about all the anime being releases in a season.
* Gather anime-related news (include light-novels, manga, films...). 160 news available.
* Make an anime search.
* Get different information for this anime.
* Get only the best result for an anime search.
* Access the full official MyAnimeList API (includes search, add, update and delete from your user watch lists).

_MalScraper_ is being developed mainly for [_KawAnime_](https://github.com/Kylart/KawAnime) but anyone can use it for
 its own purpose.

Any contribution is welcomed.

## Installation
```npm install --save mal-scraper```

## Use
```javascript
const malScraper = require('mal-scraper')
```

### Search anime
```javascript
const malScraper = require('mal-scraper')

const name = 'Sakura Trick'
const url = 'https://myanimelist.net/anime/20047/Sakura_Trick'

// For both those methods, `data` is an object containing all sort of information
malScraper.getInfoFromName(name)
  .then((data) => console.log(data))
  .catch((err) => console.log(err))

// This method is faster than getInfoFromName since it makes only one http call
malScraper.getInfoFromName(url)
  .then((data) => console.log(data))
  .catch((err) => console.log(err))

// delivers an array containing 10 entries about possible animes you are looking for for this name
malScraper.getResultsFromSearch(name)
  .then((data) => console.log(data))
  .catch((err) => console.log(err))
```

### Get a user watch list
```javascript
const malScraper = require('mal-scraper')

const username = 'Kylart'

// Get you an object containing all the entries with status, score... from this user's watch list
malScraper.getWatchListFromUser(username)
  .then((data) => console.log(data))
  .catch((err) => console.log(err))
```

### Get seasonal information
```javascript
const malScraper = require('mal-scraper')

const year = 2017
const season = 'fall'

malScraper.getSeason(year, season)
  // `data` is an object containing the following keys: 'TV', 'OVAs', 'Movies'
  .then((data) => console.log(data))
  .catch((err) => console.log(err))
```

### Get news
```javascript
const malScraper = require('mal-scraper')

malScraper.getNewsNoDetails()
  // `data` is an array containing 160 entries
  .then((data) => console.log(data))
  .catch((err) => console.log(err))
```

### Use the official MyAnimeList API
> This requires a valid MyAnimeList account

```javascript
const malScraper = require('mal-scraper')

const api = new malScraper.officialApi({
  username: 'my_super_username',
  password: 'my_super_secret_password'
})

const name = 'Sakura Trick'
const id = 20047  // ID of this anime on MyAnimeList

// This api offers three methods: search, actOnList and checkCredentials
api.checkCredentials()
  .then((data) => console.log(data))
  .catch((err) => console.log(err))

// type can be either 'anime' or 'manga'
api.search(type = 'anime', name)
  .then((data) => console.log(data))
  .catch((err) => console.log(err))

api.actOnList({
  support: 'anime', // Can be either 'anime' or 'manga'
  action: 'add' // Can be either 'add', 'update' or 'delete'
}, id, {
  // All the opts are as described at this link: https://myanimelist.net/modules.php?go=api#animevalues
  status: 1,
  score: 10
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
