//packages and requires ===================================================

const Twit = require("twit");
const config = require("./config.js");
var T = new Twit(config);

const fetch = require("node-fetch");
require("dotenv").config();
const fs = require("fs");

//api key and endpoint ====================================================

const NASA_API_key = process.env.NASA_API_KEY;
const NASA_API = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_key}`;

const run = async () => {
  const apod = await fetch(NASA_API);
  const data = await apod.json();

  if (data.url.endsWith(".jpg")) {
    await upload_image(data);
  } else {
    upload_video(data);
  }
};

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

    setInterval(() => checkTimeDiff(json), 1000 * 60 * 60);
  });
}

function checkTimeDiff(json) {
  const previousTime = toSeconds(json.timestamp);
  const currentTime = toSeconds(new Date().toLocaleTimeString());

  const oneDayInSeconds = 86400;
  if (currentTime - previousTime < oneDayInSeconds) {
    console.log("not enough time has elapsed");
  } else if (currentTime - previousTime >= oneDayInSeconds) {
    console.log("it has been at least 24 hours. It is ok to post again");
    run();
    recordTime();
  }
}

function toSeconds(t) {
  const bits = t.split(":");
  return bits[0] * 3600 + bits[1] * 60 + bits[2] * 1;
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
      console.log("error message: ", err);
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
