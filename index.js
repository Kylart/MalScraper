/**
 * Created by Kylart on 07/12/2016.
 */

const req = require('req-fast')
const cheerio = require('cheerio')

const SEASON_URL_PATH = 'https://myanimelist.net/anime/season/'

// For performance
let t1, t2

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
    $('.image').each( function () {
        animeJSON.images.push($(this).attr('data-bg'))
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

let getSeason = (year, season) => {
    t1 = Date.now()

    const url = `${SEASON_URL_PATH}${year}/${season}`

    req(url, (err, response) => {
        if (err) throw err

        const html = response.body
        const $ = cheerio.load(html)

        loadJSON($)

        // Make array to return
        let result = []

        for (let i = 0; i < animeJSON.titles.length; ++i)
        {
            result.push({
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

        console.log(result[0])

        t2 = Date.now()
        console.log(`Seasonal information gathered in: ${(t2 - t1) / 1000}s.`)
    })
}

getSeason(2017, 'winter')