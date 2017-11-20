const _ = require('lodash')
const axios = require('axios')
const {parseString} = require('xml2js')

const malToNormal = {
  // Anime values
  series_animedb_id: 'animedbID',
  series_title: 'title',
  series_synonyms: 'synonyms',
  series_type: 'type',
  series_episodes: 'nbEpisodes',
  series_status: 'seriesStatus',
  series_start: 'seriesStart',
  series_end: 'seriesEnd',
  series_image: 'picture',
  my_id: 'myID',
  my_watched_episodes: 'nbWatchedEpisode',
  my_start_date: 'myStartDate',
  my_finish_date: 'myEndDate',
  my_score: 'score',
  my_status: 'status',
  my_rewatching: 'rewatching',
  my_rewatching_ep: 'rewatchingEp',
  my_last_updated: 'lastUpdate',
  my_tags: 'tags',
  // MyAnimeList values
  user_id: 'userID',
  user_watching: 'nbWatching',
  user_completed: 'nbCompleted',
  user_onhold: 'nbOnHold',
  user_dropped: 'nbDropped',
  user_plantowatch: 'nbPlanToWatch',
  user_days_spent_watching: 'nbDaysSpentWatching'
}

const flatten = (obj) => {
  const res = {}

  _.each(obj, (value, key) => {
    res[malToNormal[key]] = value[0]
  })

  return res
}

/**
 * Allows to retrieve a user's watch lists and stuff.
 * @param {string} user The name of the user.
 * @param {string} type Can be either 'anime' or 'manga'
 *
 * @returns {promise}
 */

const getWatchListFromUser = (user) => {
  return new Promise((resolve, reject) => {
    if (!user) {
      reject(new Error('[Mal-Scraper]: No user received.'))
      return
    }

    axios.get(`https://myanimelist.net/malappinfo.php`, {
      params: {
        u: user,
        status: 'all',
        type: 'anime' // This can be changed to 'manga' too to retrieve manga lists.
      }
    })
      .then(({data}) => {
        parseString(data, (err, res) => {
          /* istanbul ignore next */
          if (err) reject(err)

          const mal = res.myanimelist

          resolve({
            stats: flatten(mal.myinfo[0]),
            lists: _.map(mal.anime, obj => flatten(obj))
          })
        })
      })
      .catch(/* istanbul ignore next */(err) => reject(err))
  })
}

module.exports = {
  getWatchListFromUser
}
