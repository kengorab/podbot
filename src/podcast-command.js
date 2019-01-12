require('dotenv').config()
require('isomorphic-fetch')
const dayjs = require('dayjs')
const truncate = require('lodash.truncate')
const { search } = require('./listennotes-api')

module.exports.handler = handle

async function handle(event) {
  const [[_, text]] = event.body.split('&')
    .map(pair => pair.split('='))
    .filter(([k]) => k === 'text')
  const query = decodeURIComponent(text)
  const result = await search(query)

  if (!result) {
    return wrapResponse(getErrorMessage(query))
  }

  return wrapResponse(getResponse(query, result))
}

function wrapResponse(body) {
  return {
    statusCode: 200,
    body: JSON.stringify(body)
  }
}

function getErrorMessage(query) {
  return {
    response_type: 'in_channel',
    text: `Couldn't find a movie called "${query}" :shrug:`
  }
}

function getResponse(query, result) {
  const description = truncate(result.description, {
    length: 250,
    separator: ''
  })
  const mostRecent = dayjs(result.latestPubDate).format('MMM D, YYYY')
  const genres = result.genres.join(', ')
  const allResultsLink = `https://www.listennotes.com/search/?q=${query}&scope=podcast`

  const lines = [
    `*${result.title}*`,
    description,
    `*Number of Episdes*: ${result.totalEpisodes} *Most Recent*: ${mostRecent}`,
    `*Genre${result.genres.length === 1 ? '' : 's'}*: ${genres}`,
    `*More Info*: ${result.listennotesUrl}`,
    `Wasn't what you were looking for? See all results: ${allResultsLink}`
  ]

  return {
    response_type: 'in_channel',
    text: lines.join('\n'),
    attachments: [{ image_url: result.image || result.thumbnail }]
  }
}
