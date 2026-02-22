const express = require('express')
const { cityList } = require('../data/cities')

const router = express.Router()

router.get('/', (req, res) => {
  const list = cityList
    .map((item) => {
      const pinyin = item.pinyin || ''
      const initial =
        item.initial ||
        (pinyin ? pinyin[0].toUpperCase() : item.name[0].toUpperCase())
      return {
        name: item.name,
        pinyin,
        initial: initial.toUpperCase(),
      }
    })
    .sort((a, b) => {
      const byInitial = a.initial.localeCompare(b.initial)
      if (byInitial !== 0) return byInitial
      const byPinyin = a.pinyin.localeCompare(b.pinyin)
      if (byPinyin !== 0) return byPinyin
      return a.name.localeCompare(b.name)
    })

  res.json({ list })
})

module.exports = router
