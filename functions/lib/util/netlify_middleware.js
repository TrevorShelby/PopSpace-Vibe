const Middleware = require("./middleware")
const AsyncLock = require('async-lock')
const lock = new AsyncLock();

let initialized = false
let middleware = null

const allowReturnFromEmptyEventLoop = async (event, context) => {
  // https://www.jeremydaly.com/reuse-database-connections-aws-lambda/
  context.callbackWaitsForEmptyEventLoop = false
  return false
}

const parseParams = async (event, context) => {
  const body = JSON.parse(event.body)
  context.params = body || {}
  return false
}

const getUser = async (event, context) => {
  if(!context.params.token) {
    return false
  }
  const session = await db.accounts.sessionFromToken(context.params.token)
  if(!session) {
    return false
  }
  const userId = parseInt(session.user_id)
  const user = await db.accounts.userById(userId)
  if(!user) {
    return false
  }
  context.user = user
  return false
}

module.exports = {
  init: async () => {
    await lock.acquire('with_netlify_middleware', async () => {
      if(middleware) {
        // Protect against netlify race conditions for warm context reuse
        return
      }
      middleware = new Middleware()
      const result = []

      middleware.add(allowReturnFromEmptyEventLoop)
      middleware.add(parseParams)
      middleware.add(getUser)

      return middleware

    })
    return middleware
  }
}
