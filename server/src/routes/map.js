const express = require('express')
const https = require('https')

const router = express.Router()

router.get('/geocode', (req, res) => {
  const address = String(req.query.address || '').trim()
  const ak = String(process.env.BAIDU_AK || req.query.ak || '').trim()
  if (!address || !ak) {
    res.status(400).json({ code: 'VALIDATION_ERROR', message: 'address and ak required' })
    return
  }
  const url = `https://api.map.baidu.com/geocoding/v3/?address=${encodeURIComponent(address)}&output=json&ak=${encodeURIComponent(ak)}`
  https
    .get(url, (resp) => {
      let data = ''
      resp.on('data', (chunk) => {
        data += chunk
      })
      resp.on('end', () => {
        try {
          const json = JSON.parse(data)
          res.status(200).json(json)
        } catch {
          res.status(502).json({ code: 'UPSTREAM_INVALID', message: 'invalid upstream response' })
        }
      })
    })
    .on('error', () => {
      res.status(502).json({ code: 'UPSTREAM_ERROR', message: 'upstream request failed' })
    })
})

router.get('/staticimage', (req, res) => {
  const lng = String(req.query.lng || '').trim()
  const lat = String(req.query.lat || '').trim()
  const width = String(req.query.width || '600').trim()
  const height = String(req.query.height || '220').trim()
  const zoom = String(req.query.zoom || '16').trim()
  const markers = String(req.query.markers || '1').trim()
  const ak = String(process.env.BAIDU_AK || req.query.ak || '').trim()
  if (!lng || !lat || !ak) {
    res.status(400).json({ code: 'VALIDATION_ERROR', message: 'lng, lat and ak required' })
    return
  }
  let url = `https://api.map.baidu.com/staticimage/v2?ak=${encodeURIComponent(ak)}&center=${encodeURIComponent(lng)},${encodeURIComponent(lat)}&width=${encodeURIComponent(width)}&height=${encodeURIComponent(height)}&zoom=${encodeURIComponent(zoom)}`
  if (markers !== '0') {
    url += `&markers=${encodeURIComponent(lng)},${encodeURIComponent(lat)}`
  }
  https
    .get(url, (resp) => {
      if (resp.statusCode && resp.statusCode >= 400) {
        let data = ''
        resp.on('data', (chunk) => {
          data += chunk
        })
        resp.on('end', () => {
          res.status(502).json({ code: 'UPSTREAM_ERROR', message: 'upstream request failed', details: data })
        })
        return
      }
      res.setHeader('Content-Type', resp.headers['content-type'] || 'image/png')
      resp.pipe(res)
    })
    .on('error', () => {
      res.status(502).json({ code: 'UPSTREAM_ERROR', message: 'upstream request failed' })
    })
})

module.exports = router
