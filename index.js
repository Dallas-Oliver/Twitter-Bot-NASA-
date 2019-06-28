const Twit = require("twit");
var T = new Twit(config);

const config = require("./config");
const fs = require("fs");
const fetch = require("node-fetch");
require("dotenv").config();

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const express = require("express");
const app = express();

app.listen(3000, () => console.log("listening at port 3000"));

const NASA_API_key = process.env.API_KEY;
const NASA_API = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_key}`;

fetch(NASA_API)
  .then(response => {
    return response.json();
  })
  .then(data => {
    console.log(data.url);
  })
  .catch(err => {
    if (err) {
      console.log("error2", err);
    }
  });

// function tweetIt(url) {
//   T.post("media/upload", { media_data: cat }, function(err, data, response) {
//     var mediaIdStr = data.media_id_string;
//     var altText = "NASA_APOD.";
//     var meta_params = { media_id: mediaIdStr, alt_text: { text: altText } };

//     T.post("media/metadata/create", meta_params, function(err, data, response) {
//       if (!err) {
//         var params = {
//           status: "NASA's Astronomy Picture of the Day!",
//           media_ids: [mediaIdStr]
//         };

//         T.post("statuses/update", params, function(err, data, response) {
//           console.log(data);
//         });
//       }
//     });
//   });
// }

// tweetIt();
