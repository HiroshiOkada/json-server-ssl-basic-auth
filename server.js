// server.js
const fs = require('fs')
const jsonServer = require('json-server')
const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()
const https = require('https')

const conf = JSON.parse(fs.readFileSync('./conf.json'))
conf.username = conf.username || 'admin'
conf.password = conf.password || Math.random().toString(36).slice(-9)
fs.writeFileSync('./conf.json', JSON.stringify(conf))

const getAuthText = (username, password) => {
  const buff = new Buffer(`${username}:${password}`)
  const base64str = buff.toString('base64')
  return `Basic ${base64str}`
}

const authText = getAuthText(conf.username, conf.password)

console.log(authText)

server.use((req, res, next) => {
  const auth = req.get('Authorization')
  console.log(auth)
  if (!auth || auth !== authText) {
    res.statusCode = 401
    res.setHeader('WWW-Authenticate', 'Basic realm="private"')
    res.send('Access denied')
  } else {
    next()
  }
})

server.use(middlewares)
server.use(router)

const options = {
  key: fs.readFileSync('./cert/privkey.pem'),
  cert: fs.readFileSync('./cert/cert.pem'),
  ca: [fs.readFileSync('./cert/chain.pem'), fs.readFileSync('./cert/fullchain.pem')]
}

https.createServer(options, server).listen(443)

