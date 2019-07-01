const Twit = require("twit");
const config = require("./config.js");
var T = new Twit(config);

const FileReader = require("FileReader");
const path = require("path");
const request = require("request");
const concat = require("concat-stream");
const fs = require("fs");
const fetch = require("node-fetch");
require("dotenv").config();
const base64url = require("base64url");
const pngToJpg = require("png-to-jpeg");

const express = require("express");
const app = express();

app.listen(3000, () => console.log("listening at port 3000"));

const NASA_API_key = process.env.API_KEY;
const NASA_API = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_key}`;

fetch(NASA_API)
  .then(response => {
    console.log(response);
    return response.json();
  })
  .then(data => {
    console.log(data.url);

    request.get(data.url, (err, response, body) => {
      var imageBuffer = new Buffer(body).toString("base64");
      // console.log(typeof imageBuffer);

      const filePath = "./Nasa_images/Nasa_image.jpg";

      // const buffer = new Buffer(imageBuffer.split(/,\s*/)[1], "base64");
      // pngToJpeg({ quality: 90 })(buffer).then(output =>
      //   fs.writeFileSync("./some-file.jpeg", output)
      // );

      fs.writeFile(filePath, imageBuffer, err => {
        if (err) {
          console.log("err1", err);
        }
      });

      // tweetIt(filePath);
    });
  });

// function tweetIt(source) {
//   T.post("media/upload", { media_data: source }, function(err, data, response) {
//     if (err) {
//       console.log("err2", err);
//     }
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
