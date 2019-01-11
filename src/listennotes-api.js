const genres = require('./genres.json')

module.exports.search = search

async function search(query, apiKey = process.env.MASHAPE_KEY) {
  const q = encodeURIComponent(query)
  const url = `https://listennotes.p.mashape.com/api/v1/search?q=${q}&sort_by_date=0&type=podcast`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Mashape-Key': apiKey,
        Accept: 'application/json'
      }
    })

    const { total, results } = await response.json()
    if (total === 0 || results.length === 0) {
      return null
    }
    return mapResult(results[0])
  } catch (e) {
    return null
  }
}

const mapResult = result => ({
  image: result.image,
  rss: result.rss,
  publisher: result.publisher_original,
  genres: result.genres.map(genre => genres[genre]),
  itunesId: result.itunes_id,
  title: result.title_original,
  description: result.description_original,
  earliestPubDate: result.earliest_pub_date_ms,
  thumbnail: result.thumbnail,
  email: result.email,
  latestPubDate: result.latest_pub_date_ms,
  listennotesUrl: result.listennotes_url,
  totalEpisodes: result.total_episodes
})
