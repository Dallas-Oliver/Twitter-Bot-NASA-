const Twit = require("twit");
const config = require("./config.js");
var T = new Twit(config);

const fetch = require("node-fetch");
require("dotenv").config();
const base64url = require("base64url");
const fs = require("fs");

const express = require("express");
const app = express();

app.listen(3000, () => console.log("listening at port 3000"));

const NASA_API_key = process.env.NASA_API_KEY;
const NASA_API = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_key}`;

//record current time everytime you upload,
//write timestamp as json object to local file
//check json data every minute, if it has been 24 hours since last timestamp, upload again

// const now = new Date().toLocaleTimeString();
// const time_data = {
//   timestamp: now
// };

const run = async () => {
  const apod = await fetch(NASA_API);
  const data = await apod.json();

  console.log(data.hdurl);
  console.log(data.url);

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

  const img = await img_req.buffer();

  tweet_media(img.toString("base64"));
}

function recordTime() {
  const time = new Date().toLocaleTimeString();
  const date = new Date().toLocaleDateString();

  const time_data = {
    timestamp: time,
    date: date
  };

  const data_string = JSON.stringify(time_data);

  fs.writeFile("timestamps.json", data_string, err => {
    if (err) {
      console.log(err);
    }
    console.log("time recorded");
  });
}

function readTime() {
  fs.readFile("timestamps.json", (err, data) => {
    if (err) {
      console.log(err);
    }

    const timeAndDate = data.toString();
    const json = JSON.parse(timeAndDate);
  });
}

readTime();

function tweet_status(video_url) {
  T.post(
    "statuses/update",
    {
      status: `#100DaysofCode This video was posted automatically using a Twitter bot!  ${video_url}`
    },
    function(err, data, response) {
      console.log(data);
      recordTime();
    }
  );
}

function tweet_media(image_data) {
  T.post("media/upload", { media_data: image_data }, function(
    err,
    data,
    response
  ) {
    if (err) {
      console.log("err1", err);
    }

    var mediaIdStr = data.media_id_string;

    var params = {
      status:
        "#100DaysofCode NASA's Astronomy Picture of the Day posted using a Twitter Bot!",
      media_ids: [mediaIdStr]
    };

    T.post("statuses/update", params, function(err, data, response) {
      recordTime();
    });
  });
}

function checkTime() {
  if (true === false) {
    run();
  }
}

checkTime();
