const express = require("express")
const bodyParser = require("body-parser")
const serverless = require("serverless-http")
const cors = require("cors")
require("dotenv").config()

let Twit = require("twit")

const config = {
  consumer_key: process.env.consumer_key,
  consumer_secret: process.env.consumer_secret,
  access_token: process.env.access_token,
  access_token_secret: process.env.access_token_secret,
}

let T = new Twit(config)

const app = express()
const router = express.Router()

app.use(bodyParser.urlencoded({ extended: false }))
// app.use(cors())

router.post("/", (req, res, next) => {
  T.get(
    "statuses/lookup",
    {
      id: [req.body.id],
      tweet_mode: "extended",
    },
    function (err, data, response) {
      res.json(data)
    }
  )
})

app.use("/getTweets/", router)

module.exports.handler = serverless(app)
