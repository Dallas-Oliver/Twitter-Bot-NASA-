const Twit = require("twit");
const config = require("./config");
var T = new Twit(config);

const path = require("path");
const request = require("request");
const concat = require("concat-stream");
const fs = require("fs");
const fetch = require("node-fetch");
require("dotenv").config();

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
    const image = request(data.url);

    image.pipe(
      concat({ encoding: "buffer" }, buf => {
        const ext = path.extname(data.url).slice(1);

        if (ext === "svg") ext = "svg+xml";
        const src = "data:image/" + ext + ";base64," + buf.toString("base64");
        console.log(src);
      })
    );
  })
  .catch(err => {
    if (err) {
      console.log("error2", err);
    }
  });

function tweetIt(source) {
  T.post("media/upload", { media_data: source }, function(err, data, response) {
    var mediaIdStr = data.media_id_string;
    var altText = "NASA_APOD.";
    var meta_params = { media_id: mediaIdStr, alt_text: { text: altText } };

    T.post("media/metadata/create", meta_params, function(err, data, response) {
      if (!err) {
        var params = {
          status: "NASA's Astronomy Picture of the Day!",
          media_ids: [mediaIdStr]
        };

        T.post("statuses/update", params, function(err, data, response) {
          console.log(data);
        });
      }
    });
  });
}
