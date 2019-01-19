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
 "b2xVn2": {longURL:"http://www.lighthouselabs.ca", user_id: "userRandomID1" },
 "9sm5xK": {longURL:"http://www.google.com", user_id: "user2RandomID2" },
 "pkwTRK": {longURL:"http://www.instagram.com", user_id: "user2RandomID3" }
};

/// User database
const users = {
  "userRandomID1": {
    user_id: "userRandomID1",
    email: "tatiana@homeaway.com",
    password: "tacos"
  },
 "user2RandomID2": {
    user_id: "user2RandomID2",
    email: "jake@homeaway.com",
    password: "disneyland"
  },
  "user2RandomID3": {
    user_id: "user2RandomID3",
    email: "kristen@homeaway.com",
    password: "waterloo"
  }
}

//random user id
function generateRandomId() {
  let chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
  let string_length = 8;
  let randomid = '';
  for (var i = 0; i < string_length; i++) {
    var rnum = Math.floor(Math.random() * chars.length);
    randomid += chars.substring(rnum, rnum + 1);
  }
  return randomid
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let user_id = req.cookies["user_id"];
  let user = users[user_id];
   if (!user) {
    res.redirect('/login');
  } else {
    let templateVars = { 
      urls: urlsForUserId (user_id),
      username: user.email
    };
    res.render("urls_index", templateVars);    
  }
});

function urlsForUserId(id) {
 var newUrls = {};
 for (var A in urlDatabase) {
  if (id == urlDatabase[A].user_id){
    newUrls[A] = urlDatabase[A]
  }
 }

 return newUrls
}


//create a new url
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
 if (!user) {
    res.redirect('/login');
 }
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
  
  if
 (urlDatabase.user_id == req.cookies["user_id"]){
  req.cookies["urls/:shortURL"]
 }
 else {
  response.redirect('/login')
}
})

// allow to modify 

//editing page 
app.get("/urls/:id", (req, res) => {
  let user_id = req.cookies["user_id"];
  let user = users[user_id];
  let templateVars = { shortURL: req.params.id, 
                      urls: urlDatabase, 
                      longURL: urlDatabase[req.params.id],
                      username: users.email 
    };
  res.render("urls_show", templateVars);
});

//MAKE changes
app.post("/urls/:id", (request, response) => {
  console.log(request.body.newurl)
  let urlsToEditId = request.params.id
  urlDatabase[urlsToEditId] = request.body.newurl

  response.redirect('/urls')
});

// cookies log out
app.post("/logout", (request, response) => {
  //changed the cookie name form username to user_id
response.clearCookie('user_id');
response.redirect('/login')
  });


app.get('/register', (req, res) => {
  res.render('register')
})

// set cookies for username and password and User ID 
app.post('/register', (req, res) => {
let user_id = generateRandomId();
let email = req.body.email
let password = req.body.password

console.log(user_id)
let userInDatabaseEmail = false
//a for loop that finds a user with that email in our database

for (var id in users) {
  if (users[id].email === email) {
  
// if you find it, put that users email in userInDatabaseEmail
//if true 
userInDatabaseEmail = true
}
}

 if (email === ''){
    res.status(400).send("Error code:400 -Sorry! try registering using an email.");
  } else if (password=== ''){
    res.status(400).send("Error code:400 -Sorry! try registering using a password.");
  } else if (userInDatabaseEmail === true){
    res.status(400).send("Error code:400 - Sorry! Email has been already register, Pick a unique email");
  }
  else {
    users[user_id] = { user_id: user_id,
      email: email, password: password};
      res.cookie('user_id', user_id)
     res.redirect('/urls')
  }

  })

  app.get('/login', (request, response) => {
    response.render('login')
  })

  app.post('/login', (request, response) => {
    let password = request.body.password
    let email = request.body.email
    
    console.log(password,email);
    
    //a for IN loop that finds if user or password has been register
    for (var id in users) {
      if (users[id].email === email) { 
        if (users[id].password === password) { 
             response.cookie('user_id', id)
             response.redirect('/urls')
        }
      }
    }

    response.status(400).send("wrong, The email or password is inccorrect");

 }) 

  //random user id
function generateRandomId() {
  let chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
  let string_length = 8;
  let randomid = '';
  for (var i = 0; i < string_length; i++) {
    var rnum = Math.floor(Math.random() * chars.length);
    randomid += chars.substring(rnum, rnum + 1);
  }
  return randomid
}

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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

