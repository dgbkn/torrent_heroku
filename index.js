const express = require("express");
const fs = require("fs");
const path = require("path");
const http = require("http");
const request = require("request");
const app = express();
var cors = require("cors");
var os = require("os");
var querystring = require('querystring');
const isMagnet = require("./scrapers/utils/misc_utils.js").isMagnet;
const cheerio = require("cheerio");
const BASE_URL = require("./scrapers/constants").BASE_URL_1337X;

const { default: axios } = require("axios");

const TorrentSearchApi = require('torrent-search-api');

const TorrentIndexer = require("torrent-indexer");

// const cloudflareScraper = require('cloudflare-scraper');

const Scraper_1337x = require("./scrapers/1337x.js");
const skytorrent = require("./scrapers/skytorrents.js");
const rarbg = require("./scrapers/rarbg.js");
const kickass = require("./scrapers/kickass.js");
const limetorrents = require("./scrapers/limetorrents.js");
const torrentgalaxy = require("./scrapers/torrent_galaxy.js");
const torrentdownloads = require("./scrapers/torrentdownloads.js");
const nyaa = require("./scrapers/nyaa.js");
const thepiratebay = require("./scrapers/thepiratebay.js");
const horriblesubs = require("./scrapers/horriblesubs.js");

app.use(cors());

app.use("/api", Scraper_1337x);
app.use("/api", skytorrent);
app.use("/api", rarbg);
app.use("/api", kickass);
app.use("/api", limetorrents);
app.use("/api", torrentgalaxy);
app.use("/api", torrentdownloads);
app.use("/api", nyaa);
app.use("/api", thepiratebay);
app.use("/api", horriblesubs);





app.get("/", (req, res) => {
  try {
    var uri = req.query.uri; // $_GET["id"]
    req
      .pipe(request.get(uri))
      .on("error", function (e) {
        res.send(e);
      })
      .pipe(res)
  } catch (e) {
    res.send(e);
  }
});



app.get("/api/search", async function (req, res) {
  try {
    TorrentSearchApi.enablePublicProviders();
    // const torrentIndexer = new TorrentIndexer();

    var query = req.query.search.trim();

    toor1 = await TorrentSearchApi.search(query);

    var finalTor = [];

    for (let i = 0; i < toor1.length; i++) {
      var magnet = toor1[i]?.magnet;

      if (toor1[i].provider == "1337x") {

        try {
          var url = toor1[i]?.desc;
          response = await axios.get(url.replace('x','xx')).catch((err) => {
            console.log(err);
              magnet = "";
          });
          if (response != undefined) {
            $ = cheerio.load(response.data);
            magnet = $(".clearfix ul li a").attr("href");
            if (isMagnet(magnet)) {
             magnet = magnet;
            } else {
              magnet = "";
            }
          } else {
            magnet = "";
          }
        } catch (e) {
          magnet = "";
        }
      }

      finalTor.push( {
        ...toor1[i],
        "leechers": toor1[i].peers,
        "name": toor1[i].title,
        "seeders": toor1[i].seeds,
        "upload_date": toor1[i].time,
        "uploader": "",
        "website": toor1[i].provider,
        "magnet": magnet,
        "torrent_url": toor1[i].link ? toor1[i].link : toor1[i]?.desc?.replace('1337x', '1337xx')

      });

    
    }

    
    res.json({ "data": finalTor });

  } catch (ss) {
    res.json(ss);
  }
});


app.get("/search", async function (req, res) {
  try {
    TorrentSearchApi.enablePublicProviders();
    // const torrentIndexer = new TorrentIndexer();

    var query = req.query.q;

    var toor1 = {};
    var toor2 = {};
    var toor3 = {};

    toor1 = await TorrentSearchApi.search(query);
    // torr2 = await torrentIndexer.search(query);
    toor3 = await axios.post("http://35.232.241.212:8080/search", querystring.stringify({ "type": "search", "query": query }), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });

    // console.log(toor3);


    var torrents = { "toorSearch": toor1, "toorindex": toor2, "oldschool": toor3.data };

    res.json(torrents);

  } catch (ss) {
    res.json(ss);
  }
});


// app.get("/bt4g", async function (req, res) {
//   try{

//   var query = req.query.q;
//   var results = await cloudflareScraper.get('https://bt4g.org/search/'+encodeURIComponent(query));

//     res.send(results);

//   } catch (ss) {
//     res.json(ss);
//   }
//   });






// app.use((req, res, next) => {
//   const error = new Error("Not found");
//   error.status = 404;
//   next(error);
// });

// error handler middleware
app.use((error, req, res, next) => {
  res.status(error.status || 500).send({
    error: {
      status: error.status || 500,
      message: error.message || "Internal Server Error",
    },
  });
});

app.listen(process.env.PORT || 3000);
