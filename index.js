const Twit = require("twit");
const config = require("./config.js");
var T = new Twit(config);

const base64url = require("base64url");

const fetch = require("node-fetch");
require("dotenv").config();

const express = require("express");
const app = express();

app.listen(3000, () => console.log("listening at port 3000"));

const NASA_API_key = process.env.NASA_API_KEY;
const NASA_API = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_key}`;

const run = async () => {
  const apod = await fetch(NASA_API);
  const data = await apod.json();

  console.log("image: " + data.hdurl);
  console.log("video: " + data.url);

  if (is_image(data)) {

    await upload_image(data);

  } else if (is_video(data)) {

    upload_video(data);

  }
};

function is_video(data) {
  return data.url;
}

function is_image(data) {
  return data.hdurl;
}

function upload_video(data) {
  const regex = /https:\/\/www\.youtube\.com\/embed\/(.+)/;
  const match = regex.exec(data.url);
  const videoId = match[1];
  const url = `https://youtube.com/watch?v=${videoId}`;

  tweet_status(url);
}

async function upload_image(data) {
  const img_req = await fetch(data.hdurl);
  const img = await img_req.text();
  const base64 = base64url(img);

  tweet_media(base64);
}

function tweet_status(video_url) {
  T.post("statuses/update", { status: video_url }, function(err, data, response) {
    console.log(data)
  });
}

function tweet_media(image_data) {
  T.post("media/upload", { media_data: image_data }, function(err, data, response) {
    if (err) {
      console.log(err);
    }
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

run();