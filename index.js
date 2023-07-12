const isUrl = require('is-url');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require("body-parser");




// Basic mongoose and Schema
const mongoose = require('mongoose')

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const Schema = mongoose.Schema;

const urlSchema = new Schema({
  original_url: String,
  short_url: String,
});

const Url = mongoose.model("Url", urlSchema);



// Basic Configuration
const port = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({ extended: "false" }));
app.use(bodyParser.json());

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', function(req, res) {
  const original_url = req.body.url;
  //check if valid url
  if (!isUrl(original_url)){
    return res.json( {error: 'invalid url'} )
  }
  const existingUrl = Url.findOne(
    { original_url: original_url},
    'original_url short_url'
  ).then(function(data){
    if(data){
      return res.send({original_url: data.original_url, short_url: data.short_url});
    } else {
      //not sure if there is an easy way to serialize in mongodb
      const count = Url.find().countDocuments().then((data) => {
        
        let shortId = Math.floor(Math.random() * 1000);
        shortId = parseInt(''+data+shortId);
        
        const shortened = Url({
          original_url: original_url,
          short_url: shortId
        });
        
        
        shortened.save()
        
        res.json({ original_url: shortened.original_url, short_url: shortened.short_url });  

        
      })
    }
  })
  //check if it 
  //save to db and return short string
  
  
  //response json
  
});

app.get('/api/shorturl/:shortid?', function(req, res) {
  //check if short url exists
  const exists = Url.findOne({ short_url: req.params.shortid }).then(function(data){
    if (data){
      res.redirect(data.original_url);
    } else {
      res.json({eita: 'sifudeu'})    
    }
  })
  
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
