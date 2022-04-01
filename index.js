const express = require("express");
const fs = require("fs");
const path = require("path");
const http = require("http");
const request = require("request");
const app = express();
var cors = require("cors");
var os = require("os");
var querystring = require('querystring');

const { default: axios } = require("axios");

const TorrentSearchApi = require('torrent-search-api');

const TorrentIndexer = require("torrent-indexer");

// const cloudflareScraper = require('cloudflare-scraper');



app.use(cors());


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



app.get("/search", async function (req, res) {
  try{
    TorrentSearchApi.enablePublicProviders();
    // const torrentIndexer = new TorrentIndexer();

  var query = req.query.q;
  
  toor1 = await TorrentSearchApi.search(query);
  
    res.json(toor1);

  } catch (ss) {
    res.json(ss);
  }
  });


app.get("/searchAll", async function (req, res) {
  try{
    TorrentSearchApi.enablePublicProviders();
    // const torrentIndexer = new TorrentIndexer();

  var query = req.query.q;
  
  var toor1 = {};
  var toor2 = {};
  var toor3 = {};

  toor1 = await TorrentSearchApi.search(query);
  // torr2 = await torrentIndexer.search(query);
  toor3 = await axios.post("http://35.232.241.212:8080/search",querystring.stringify({"type":"search","query":query}), {
    headers: { 
      "Content-Type": "application/x-www-form-urlencoded"
    }
  });

  // console.log(toor3);


  var torrents = {"toorSearch":toor1,"toorindex":toor2,"oldschool":toor3.data};
  
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






app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

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
