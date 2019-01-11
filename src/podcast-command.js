require('dotenv').config()
require('isomorphic-fetch')
const express = require('express')
const { urlencoded } = require('body-parser')
const dayjs = require('dayjs')
const truncate = require('lodash.truncate')
const { search } = require('./listennotes-api')

const app = express()
app.use(urlencoded())

app.post('/', async (req, res) => {
  const { text } = req.body
  const query = decodeURIComponent(text)
  const result = await search(query)

  if (!result) {
    res.json({
      response_type: 'in_channel',
      text: `Couldn't find a podcast called "${query}" :shrug:`
    })
    return
  }

  const description = truncate(result.description, {
    length: 250,
    separator: ''
  })
  const mostRecent = dayjs(result.latestPubDate).format('MMM D, YYYY')
  const genres = result.genres.join(', ')
  const allResultsLink = `https://www.listennotes.com/search/?q=${text}&scope=podcast`

  const lines = [
    `*${result.title}*`,
    description,
    `*Number of Episdes*: ${result.totalEpisodes} *Most Recent*: ${mostRecent}`,
    `*Genre${result.genres.length === 1 ? '' : 's'}*: ${genres}`,
    `*More Info*: ${result.listennotesUrl}`,
    `Wasn't what you were looking for? See all results: ${allResultsLink}`
  ]

  const body = {
    response_type: 'in_channel',
    text: lines.join('\n'),
    attachments: [{ image_url: result.image || result.thumbnail }]
  }

  res.json(body)
})

const port = process.env.NODE_PORT || 5050
app.listen(port, () => console.log(`Listening on :${port}`))
