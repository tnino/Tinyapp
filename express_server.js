var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
var morgan = require('morgan')
var express = require('express')
var cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');

var app = express()
app.use(cookieSession({
  name: 'session',
  keys: ["tacos"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
  extended: true
}));

app.set("view engine", "ejs");
app.use(morgan('dev'));
app.use(express.static('public'));

var urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    user_id: "userRandomID1"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    user_id: "user2RandomID2"
  },
  "pkwTRK": {
    longURL: "http://www.instagram.com",
    user_id: "user2RandomID3"
  }
};

/// User database
const users = {
  "userRandomID1": {
    user_id: "userRandomID1",
    email: "tatiana@homeaway.com",
    password: bcrypt.hashSync("tacos", 10)
  },
  "user2RandomID2": {
    user_id: "user2RandomID2",
    email: "jake@homeaway.com",
    password: bcrypt.hashSync("disneyland", 10)
  },
  "user2RandomID3": {
    user_id: "user2RandomID3",
    email: "kristen@homeaway.com",
    password: bcrypt.hashSync("water", 10)
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

app.get("/", (request, response) => {
  response.send("Hello!");
});

app.get("/urls.json", (request, response) => {
  response.json(urlDatabase);
});

app.get("/hello", (request, response) => {
  response.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (request, response) => {
  let user_id = request.session["user_id"];
  let user = users[user_id];
  if (!user) {
    response.redirect('/login');
  } else {
    let templateVars = {
      urls: urlsForUserId(user_id),
      username: user.email
    };
    response.render("urls_index", templateVars);
  }
});

function urlsForUserId(id) {
  var newUrls = {};
  for (var A in urlDatabase) {
    if (id == urlDatabase[A].user_id) {
      newUrls[A] = urlDatabase[A]
    }
  }
  return newUrls
}


//create a new url
app.get("/urls/new", (request, response) => {
  response.render("urls_new");
  if (!user) {
    response.redirect('/login');
  }
});

//redirect page
app.get("/u/:shortURL", (request, response) => {
  let longURL = urlDatabase[request.params.shortURL].longURL
  console.log(longURL);
  response.redirect(longURL);
});

//ADD a new link
app.post("/urls", (request, response) => {
  let newurl = generateRandomString()
  let longURL = request.body.longURL
  let shortURL = newurl
  urlDatabase[shortURL] = {
    longURL: request.body.longURL,
    user_id: request.session["user_id"]
  };
  console.log(urlDatabase);
  console.log(request.body); // debug statement to see POST parameters
  response.redirect('/urls') // Respond with 'Ok' (we will replace this) 
});

//DELETE
app.post('/urls/:id/delete', function (request, response) {
  let urlsToDeleteId = request.params.id
  delete urlDatabase[urlsToDeleteId]
  response.redirect('/urls')

  if (urlDatabase.user_id == request.session["user_id"]) {
    request.session["urls/:shortURL"]
  } else {
    response.redirect('/login')
  }
})

// allow to modify 

//editing page 
app.get("/urls/:id", (request, response) => {
  let user_id = request.session["user_id"];
  let user = users[user_id];
  let templateVars = {
    shortURL: request.params.id,
    urls: urlDatabase,
    longURL: urlDatabase[request.params.id],
    username: users.email
  };
  response.render("urls_show", templateVars);
});

//MAKE changes
app.post("/urls/:id", (request, response) => {
  console.log(request.body.newurl)
  let urlsToEditId = request.params.id
  let user_id = request.session["user_id"];

  urlDatabase[urlsToEditId].longURL = request.body.newurl

  response.redirect('/urls')
});

// cookies log out
app.post("/logout", (request, response) => {
  //changed the cookie name form username to user_id
  request.session.user_id;


  response.redirect('/login')
});


app.get('/register', (request, response) => {
  response.render('register')
})

// set cookies for username and password and User ID 
app.post('/register', (request, response) => {
  let user_id = generateRandomId();
  let email = request.body.email
  let password = request.body.password
  const hashedPassword = bcrypt.hashSync(password, 10);


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

  if (email === '') {
    response.status(400).send("Error code:400 -Sorry! try registering using an email.");
  } else if (password === '') {
    response.status(400).send("Error code:400 -Sorry! try registering using a password.");
  } else if (userInDatabaseEmail === true) {
    response.status(400).send("Error code:400 - Sorry! Email has been already register, Pick a unique email");
  } else {
    users[user_id] = {
      user_id: user_id,
      email: email,
      password: hashedPassword
    }
    request.session.user_id = user_id
    response.redirect('/urls')
  }
})

app.get('/login', (request, response) => {
  response.render('login')
})

app.post('/login', (request, response) => {
  let password = request.body.password
  let email = request.body.email

  console.log(password, email);

  //a for IN loop that finds if user or password has been register
  for (var id in users) {
    if (users[id].email === email) {
      if (bcrypt.compareSync(password, users[id].password)) {
        request.session.user_id = id
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