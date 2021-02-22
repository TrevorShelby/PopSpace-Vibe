const fs = require('fs')
const express = require('express')
const https = require('https')
const ws = require('ws')
const Participants = require("./server/participants")
const EventProcessor = require("./server/event_processor")

const loadSsl = () => {
  const privateKey  = fs.readFileSync(process.env.SSL_PRIVATE_KEY_PATH, 'utf8')
  const certificate = fs.readFileSync(process.env.SSL_CERTIFICATE_PATH, 'utf8')
  return { key: privateKey, cert: certificate }
}

class Mercury {
  constructor(port, heartbeatTimeoutMillis) {
    this.port = port
    this.express = express()
    this.api = new api.MercuryApi(this)
    this.participants = new Participants(heartbeatTimeoutMillis)
    this.eventProcessor =  new EventProcessor(this.participants)

    this.ws = new ws.Server({ noServer: true })
    this.ws.on('connection', (socket) => {
      this.participants.addSocket(socket)
    })

    this.ws.on('close', () => {
      log.app.warn("socket server shut down")
    })
  }

  getExpress() {
    return this.express
  }

  async getSocketGroup(roomId) {
    return this.participants.getSocketGroup(roomId)
  }

  async start() {
    return new Promise((resolve, reject) => {
      this.server = https.createServer(loadSsl(), this.express)
      this.server.on('upgrade', (request, socket, head) => {
        // Standard http upgrade procedure
        // https://www.npmjs.com/package/ws#multiple-servers-sharing-a-single-https-server
        this.ws.handleUpgrade(request, socket, head, (socket) => {
          this.ws.emit('connection', socket, request)
        })
      })

      this.listen = this.server.listen(this.port, () => {
        log.app.info(`Server live on port ${this.port}`)
        resolve()
      })
    })
  }

  async stop() {
    await this.participants.disconnectAll()
    return new Promise((resolve, reject) => {
      this.server.close(() => {
        log.app.info(`Server stopped.`)
        this.ws.close(() => {
          log.app.info(`WebSocket stopped.`)
          resolve()
        })
      })
    })
  }

  clientsCount() {
    return this.participants.count()
  }
}

module.exports = Mercury
