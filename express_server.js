var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
var morgan = require('morgan')
var express = require('express')
var cookieParser = require('cookie-parser')

var app = express()
app.use(cookieParser())

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.use(morgan('dev'));


var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "pkwTRK": "http://www.instagram.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

///mainpage
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies["username"]};
  res.render("urls_index", templateVars);
});

//create a new url
app.get("/url", (req, res) => {
  res.render("urls_new");
});

//redirect page
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]
  console.log(longURL);
  res.redirect(longURL);
});

//ADD a new link
app.post("/urls", (req, response) => {
  let newurl = generateRandomString()
  let longURL = req.body.longURL
  let shortURL = newurl
  urlDatabase[shortURL] = longURL;
  console.log(urlDatabase);
  console.log(req.body);  // debug statement to see POST parameters
  response.redirect('/urls')         // Respond with 'Ok' (we will replace this) 
});

//DELETE
app.post('/urls/:id/delete', function (request, response) {
  let urlsToDeleteId = request.params.id
  delete urlDatabase[urlsToDeleteId]
  response.redirect('/urls')
})

//editing page 
app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, urls: urlDatabase, longURL: urlDatabase[req.params.id],
    username: req.cookies["username"]};
  res.render("urls_show", templateVars);
});

//MAKE changes
app.post("/urls/:id", (request, response) => {
  console.log(request.body.newurl)
  let urlsToEditId = request.params.id
  urlDatabase[urlsToEditId] = request.body.newurl

  response.redirect('/urls')
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// cookies log in 
app.post("/login", (request, response) => {
let username = request.body.username
response.cookie('username', username) 
response.redirect('/urls')
console.log("name" + ", you have successfully logged in !")
});

// cookies log out
app.post("/logout", (request, response) => {
response.clearCookie('username');
response.redirect('/urls')
  });

//random function
function generateRandomString() {
  var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
  var string_length = 6;
  var results = '';
  for (var i = 0; i < string_length; i++) {
    var rnum = Math.floor(Math.random() * chars.length);
    results += chars.substring(rnum, rnum + 1);
  }
  return results
}
generateRandomString()