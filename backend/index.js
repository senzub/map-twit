var bodyParser = require('body-parser');
const cors = require('cors');
var cookieParser = require('cookie-parser');
const express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var session = require('express-session');
let Twitter = require("twitter");
let config = require('./config.js');
const helmet = require('helmet');


const app = express();

app.use(cors());

// Enable CORS
app.use((req, res, next) => {
   res.header('Access-Control-Allow-Origin', '*');
   res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE');
   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested With, Content-Type, Accept');
   next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({secret: 'whatever', resave: true, saveUninitialized: true}))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(logger('tiny'));

let T = new Twitter(config);


app.get('/userInfo/:screenname', (req, res) => {
  let params = {
    screen_name: req.params.screenname
  };

  T
  .get('users/show', params)
  .then((userInfo) => {
    let editedData = {
      name: userInfo.name,
      screenName: req.params.screenname,
      location: userInfo.location,
      followingCount: userInfo["friends_count"],
      followersCount: userInfo["followers_count"],
      img: userInfo["profile_image_url"].replace('normal', '400x400'),
      favoritesCount: userInfo["favourites_count"],
      id: userInfo.id
    }
    res.send(editedData);
  })
  .catch((err) => {
    res.status(500);
  })
})


app.get('/followers/:screenname', (req, res) => {
  let params = {
    screen_name: req.params.screenname
  };

  T
  .get('followers/list', params)
  .then((array) => {
    let followers = array.users.map((follower) => {
      return {
        id: follower["id"],
        stringId: follower["id_str"],
        name: follower["name"],
        screenName: follower["screen_name"],
        location: follower['location'],
        followersCount: follower["followers_count"],
        followingCount: follower["friends_count"],
        favoritesCount: follower["favourites_count"],
        image: follower["profile_image_url"]
      }
    })
    res.send(followers);
  })
  .catch((err) => console.log(err))
})

app.get('/following/:screenname', (req, res) => {
  let params = {
    screen_name: req.params.screenname
  };

  T
  .get('friends/list', params)
  .then((array) => {
    let following = array.users.map((follower) => {
      return {
        id: follower["id"],
        stringId: follower["id_str"],
        name: follower["name"],
        screenName: follower["screen_name"],
        location: follower['location'],
        followersCount: follower["followers_count"],
        followingCount: follower["friends_count"],
        favoritesCount: follower["favourites_count"],
        image: follower["profile_image_url"]
      }
    })
    res.send(following);
  })
  .catch((err) => console.log(err))
})


const port = process.env.PORT || 2400;
app.listen(port, () => console.log(`Listening on port ${port}...`));