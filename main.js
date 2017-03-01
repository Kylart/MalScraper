/**
 * Created by Kylart on 07/12/2016.
 */

const req = require('req-fast')
const cheerio = require('cheerio')

const SEASON_URL_URI = 'https://myanimelist.net/anime/season/'
const NEWS_URL_URI = 'https://myanimelist.net/news?p='

/* GETTING SEASONAL ANIMES PART */

let animeJSON = {
    titles: [],
    genres: [],
    images: [],
    scores: [],
    synopsis: [],
    producers: [],
    releaseDates: [],
    types: [],
    nbEps: [],
    fromType: [],
    stats: {
        TVNumber: 0,
        ONANumber: 0,
        OVANumber: 0,
        MovieNumber: 0,
        SpecialNumber: 0
    }
}

let loadTitles = ($) => {
    let tmp = $('.title-text').text().split('\n        ')

    tmp.shift()     // Getting rid of an empty element at the beginning.

    tmp.forEach( (elem) => {
        animeJSON.titles.push(elem.slice(0, -7))     // Loading the right name
    })
}

let loadProducer = ($) => {
    $('.producer').each( function () {
        animeJSON.producers.push($(this).text())
    })
}

let loadNbEpisodes = ($) => {
    let tmp = []

    $('.eps').each( function () {
        tmp.push($(this).text().split(' '))
    })

    // Only 16th and 17th element are interesting
    for (let i = 0; i < tmp.length; ++i)
    {
        tmp[i] = tmp[i].slice(16, 18)
    }

    tmp.forEach( (elem) => {
        animeJSON.nbEps.push(elem.join(' ').slice(0, -1))
    })
}

let loadGenres = ($) => {
    $('.genres-inner').each(function () {
        let tmp = $(this).text().split('\n        ')
        tmp.shift()

        for (let i = 0; i < tmp.length; ++i)
        {
            tmp[i] = tmp[i].slice(0, -7)
        }

        animeJSON.genres.push(tmp)
    })
}

let loadSynopsis = ($) => {
    $('.synopsis').each( function () {
        animeJSON.synopsis.push($(this).text().slice(5, -8))
    })
}

let loadImages = ($) => {
    $('.image img').each( function () {
      animeJSON.images.push($(this).attr('data-src'))
    })
}

let loadScores = ($) => {
    $('.score').each( function () {
        animeJSON.scores.push($(this).text().slice(9, 13))
    })
}

let loadReleaseDates = ($) => {
    $('.remain-time').each(function () {
        animeJSON.releaseDates.push($(this).text().slice(19, -27))
    })
}

let loadTypes = ($) => {
    let stats = {
        TVNumber: 0,        // js-seasonal-anime-list-key-1
        ONANumber: 0,       // js-seasonal-anime-list-key-5
        OVANumber: 0,       // js-seasonal-anime-list-key-2
        MovieNumber: 0,     // js-seasonal-anime-list-key-3
        SpecialNumber: 0    // js-seasonal-anime-list-key-4
    }

    $('.js-seasonal-anime-list-key-1').find('div.seasonal-anime').each(function () {
        ++stats.TVNumber
        animeJSON.types.push('TV')
    })

    $('.js-seasonal-anime-list-key-5').find('div.seasonal-anime').each(function () {
        ++stats.ONANumber
        animeJSON.types.push('ONA')
    })

    $('.js-seasonal-anime-list-key-2').find('div.seasonal-anime').each(function () {
        ++stats.OVANumber
        animeJSON.types.push('OVA')
    })

    $('.js-seasonal-anime-list-key-3').find('div.seasonal-anime').each(function () {
        ++stats.MovieNumber
        animeJSON.types.push('Movie')
    })

    $('.js-seasonal-anime-list-key-4').find('div.seasonal-anime').each(function () {
        ++stats.SpecialNumber
        animeJSON.types.push('Special')
    })

    animeJSON.stats = stats
}

let loadFromType = ($) => {
    $('.source').each(function () {
        animeJSON.fromType.push($(this).text())
    })
}

let loadJSON = ($) => {
    loadTitles($)
    loadProducer($)
    loadNbEpisodes($)
    loadGenres($)
    loadSynopsis($)
    loadImages($)
    loadScores($)
    loadReleaseDates($)
    loadTypes($)
    loadFromType($)
}

exports.getSeason = (year, season, callback) => {
    const url = `${SEASON_URL_URI}${year}/${season}`

    // Make array to return
    let result = {
        info: [],
        stats: {}
    }

    req(url, (err, response) => {
        if (err) throw err

        const html = response.body
        const $ = cheerio.load(html)

        loadJSON($)

        result.stats = animeJSON.stats

        for (let i = 0; i < animeJSON.titles.length; ++i)
        {
            result.info.push({
                title: animeJSON.titles[i],
                genres: animeJSON.genres[i],
                image: animeJSON.images[i],
                scores: animeJSON.scores[i],
                synopsis: animeJSON.synopsis[i],
                producers: animeJSON.producers[i],
                releaseDates: animeJSON.releaseDates[i],
                type: animeJSON.types[i],
                nbEp: animeJSON.nbEps[i],
                fromType: animeJSON.fromType[i]
            })
        }
        callback()
    })

    return result
}

/* END OF GETTING SEASONAL ANIMES PART */


/* GETTING ANIME RELATED NEWS PART */

let byProperty = (prop) => {
    return function(a, b) {
        if (typeof a[prop] == "number") {
            return (a[prop] - b[prop])
        }
        return ((a[prop] < b[prop]) ? -1 : ((a[prop] > b[prop]) ? 1 : 0))
    }
}

exports.getNewsNoDetails = (callback) => {
    let completedReq = 0
    let result = []

    // We have a maximum of 300 news, it's enough
    for (let i = 1; i < 16; ++i)
    {
        req(`${NEWS_URL_URI}${i}`, (err, response) => {
            if (err) throw err

            const html = response.body
            const $ = cheerio.load(html)

            let pageElements = $('.news-unit-right')   // 20 elements

            // Pictures for each element
            let images = []
            $('.image').each( function () {
                images.push($(this).attr('src'))
            })

            // Get links for info
            let links = []
            $('.image-link').each( function () {
                links.push($(this).attr('href'))
            })

            // Gathering news' Titles
            let titles = pageElements.find('p.title').text().split('\n      ')
            titles.shift()
            let texts = pageElements.find('div.text').text().split('\n      ')
            texts.shift()

            for (let i = 0; i < titles.length; ++i) {
                titles[i] = titles[i].slice(0, -5)
                texts[i] = texts[i].slice(0, -5)
            }

            for (let j = 0; j < titles.length; ++j) {
                let tmp = links[j].split('/')
                result.push({
                    title: titles[j],
                    link: links[j],
                    image: images[j],
                    text: texts[j],
                    newsNumber: tmp[tmp.length - 1]
                })
            }
            ++completedReq
            if (completedReq === 15)
            {
                // Getting the order right
                result.sort(byProperty('newsNumber'))
                result.reverse()
                callback()
            }
        })
    }
    return result
}

/* END OF GETTING ANIME RELATED NEWS PART */
