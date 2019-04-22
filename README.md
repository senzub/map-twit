# Map-Twit

'Map Twit' is a small app that I built to help me learn how to use nodeJS and connect to public APIs, in this case, the Google Maps and Twitter APIs. It allows a user to enter a screenname from twitter and see the physical locations (represented as blue twitter bird markers on the map) and proximity of either their followers, or the people they follow, given that the addresses are publicly available and accurate.

Visit [here](https://map-twit.netlify.com/)

## Prerequisites

A Twitter developer account with consumer_key, consumer_secret, access_token_key, and access_token_secret. 


## Getting Started

To run:

1. Clone this repo.
2. Open frontend and backend separately
3. Run "npm install" in each
4. In backend, create config.js with consumer_key, etc
5. In frontend, run "gulp sass" to compile SCSS, then run "python -m http.server"
6. In backend, run "npm start"
7. Open localhost:8000
