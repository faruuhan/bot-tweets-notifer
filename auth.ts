require("dotenv").config();
const Twit = require("twit");

const { APP_KEY, APP_SECRET, ACCESS_TOKEN, ACCESS_SECRET } = process.env;

const client = new Twit({
  consumer_key: APP_KEY,
  consumer_secret: APP_SECRET,
  access_token: ACCESS_TOKEN,
  access_token_secret: ACCESS_SECRET,
  timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
  strictSSL: true, // optional - requires SSL certificates to be valid.
});

export default client;
