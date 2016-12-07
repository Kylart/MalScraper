# _MalScraper_

At the moment, _MalScraper_ is able to:
* Gather information about all the anime being releases in a season

_MalScraper_ is being developed mainly for [_KawAnime_](https://github.com/Kylart/KawAnime) but anyone can use it for
 its own purpose.

Any contribution is welcomed.

## Installation
    `npm install --save mal-scraper`
    
## Use
```javascript
const malScraper = require('mal-scraper')
  
// Get information 
let seasonalInfo = malScraper.getSeason(2016, 'fall')
  
//Want stats for this season ? 
console.log(seasonalInfo.stats)
/* 
    { TVNumber: 151,
      ONANumber: 10,
      OVANumber: 32,
      MovieNumber: 24,
      SpecialNumber: 14 }
 */
  
// All the anime of this season along with their information are in seasonalInfo.info
console.log(seasonalInfo.info)
```
   

## Contributing
1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request.

## TODOs
- [x] Make it into a NPM Module
- [ ] Info for Light novels
- [ ] Info for mangas
- [ ] Daily news

## License
MIT License

Copyright (c) Kylart

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.



