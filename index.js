const Twit = require("twit");
const config = require("./config");
const fs = require("fs");
const fetch = require("node-fetch");

const NASA_API_key = process.env.API_KEY;
const NASA_API = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_key}`;

var T = new Twit(config);

async function getImage() {
  const response = await fetch(NASA_API);
  const image = await response.json();
}

const imageURL = getImage().catch(err => {
  console.log(err);
});

//

function tweetIt(url) {
  T.post("media/upload", { media_data: url }, function(err, data, response) {
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

  // T.post(
  //   "statuses/update",
  //   { status: "NASA's Astronomy Picture of the Day!" },
  //   function(err, data, response) {
  //     console.log(data);
  //   }
  // );
}

tweetIt();
