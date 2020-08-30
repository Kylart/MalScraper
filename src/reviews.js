const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URI = 'https://myanimelist.net/anime/'
const NUMBER_REVIEWS_BY_PAGE = 20;
const INITIAL_FIRST_PAGE_REVIEW = 1;

const malDateToJsDate = (malDate) => {
	return new Date(malDate);
}

const malNumberToJsNumber = (malNumber) => {
	return malNumber ? Number(malNumber) : 0;
}

const parsePage = ($) => {
  const items = $('.borderDark')
  const result = []

  items.each(function (elem) {
    const notes = $(this).find('.spaceit.pt8 div');
    const review_more = $(this).find('.spaceit.pt8 span');
    // For presenting the review only without the notes
    $(this).find('.spaceit.pt8 div').remove();
    $(this).find('.spaceit.pt8 span').remove();
    $(this).find('.spaceit.pt8 a.js-toggle-review-button').remove();

    result.push({
      author: $($(this).find('.spaceit td:nth-child(2) a')["0"]).text().trim(),
      date: malDateToJsDate($($(this).find('.spaceit .mb8 div')["0"]).text().trim()),
      seen: $(this).find('.spaceit .mb8 .lightLink').text().trim(),
      note_overall: malNumberToJsNumber($(notes).find('tr:nth-child(1) td:nth-child(2)').text().trim()),
      note_story: malNumberToJsNumber($(notes).find('tr:nth-child(2) td:nth-child(2)').text().trim()),
      note_animation: malNumberToJsNumber($(notes).find('tr:nth-child(3) td:nth-child(2)').text().trim()),
      note_sound: malNumberToJsNumber($(notes).find('tr:nth-child(4) td:nth-child(2)').text().trim()),
      note_character: malNumberToJsNumber($(notes).find('tr:nth-child(5) td:nth-child(2)').text().trim()),
      note_enjoyment: malNumberToJsNumber($(notes).find('tr:nth-child(6) td:nth-child(2)').text().trim()),
      review: $(this).find('.spaceit.pt8').text().trim() + $(review_more).text().trim()
    })
  })

  return result
}

const searchPage = (url, limit, skip, p, res = []) => {
  return new Promise((resolve, reject) => {
    axios.get(url, {
      params: {
        p
      }
    })
      .then(({ data }) => {
        const $ = cheerio.load(data)

        const tmpRes = parsePage($)
        res = res.concat(tmpRes)

		if (res.length <= limit) {
			p++;
			searchPage(url, limit, skip, p, res)
			  .then((data) => resolve(data))
			  .catch(/* istanbul ignore next */(err) => reject(err))
		} else {
		  resolve(res)
		}
      })
      .catch(/* istanbul ignore next */(err) => reject(err))
  })
}

const getReviewsFromName = (name) => {
  return new Promise((resolve, reject) => {
    getResultsFromSearch(name)
      .then((items) => {
        const { url } = items[0]

        searchPage(`${encodeURI(url)}/reviews`, limit, skip)
          .then((data) => resolve(data))
          .catch(/* istanbul ignore next */(err) => reject(err))
      })
      .catch(/* istanbul ignore next */(err) => reject(err))
  })
}

const getReviewsFromNameAndId = (id, name, limit, skip) => {
  return new Promise((resolve, reject) => {
  	if (skip !== 0) {
	  p = Math.floor(skip / NUMBER_REVIEWS_BY_PAGE) + 1;
	  skip = Math.max(0, skip - (p * NUMBER_REVIEWS_BY_PAGE));
    } else {
	  p = INITIAL_FIRST_PAGE_REVIEW;
    }

    searchPage(`${BASE_URI}${id}/${encodeURI(name)}/reviews`, limit, skip, p)
      .then((data) => resolve(data))
      .catch(/* istanbul ignore next */(err) => reject(err))
  })
}

const getReviewsList = (obj) => {
  return new Promise((resolve, reject) => {
    if (!obj) {
      reject(new Error('[Mal-Scraper]: No id nor name received.'))
      return
    }

    if (typeof obj === 'object' && !obj[0]) {
      const { id, name, limit } = obj
	  const skip = obj.skip ? obj.skip : 0

      if (!id || !name || isNaN(+id) || typeof name !== 'string') {
        reject(new Error('[Mal-Scraper]: Malformed input. ID or name is malformed or missing.'))
        return
      }

      getReviewsFromNameAndId(id, name, limit, skip)
        .then((data) => resolve(data))
        .catch(/* istanbul ignore next */(err) => reject(err))
    } else {
      getReviewsFromName(obj, limit, skip)
        .then((data) => resolve(data))
        .catch(/* istanbul ignore next */(err) => reject(err))
    }
  })
}

module.exports = {
  getReviewsList
}
