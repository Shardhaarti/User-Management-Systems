//import the require dependencies
const bcrypt = require('bcrypt');
const validator = require('validator');
const jwt = require('jsonwebtoken');


var express = require('express');
var app = express();

// ✅ Add this verifyToken middleware here
function verifyToken(req, res, next) {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).send("No token provided");
    }

    const secretKey = 'your-secret-key'; // use same key from login
    try {
        const decoded = jwt.verify(token, secretKey);
        req.user = decoded; // optional: store token payload for later use
        next(); // continue to route handler
    } catch (err) {
        return res.status(401).send("Unauthorized: Invalid token");
    }
}

var bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var cors = require('cors');
var pool = require('./models/UserDB.js');
app.set('view engine', 'ejs');

//use cors to allow cross origin resource sharing
app.use(cors({ origin: 'http://localhost:5000', credentials: true }));
//use cookie parser to parse request headers
app.use(cookieParser());
//use express session to maintain session data
app.use(session({
    secret: 'cmpe_273_secure_string',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60 * 60 * 1000 // Optional: 1 hour session expiry
    }
}));


// app.use(bodyParser.urlencoded({
//     extended: true
//   }));
app.use(bodyParser.json());

//Allow Access Control
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5000');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
    res.setHeader('Cache-Control', 'no-cache');
    next();
  });

pool.query('select * from user',  function(err, rows){
    if(err) throw err;
    else {
      console.log("Connection to DB established");
      console.log(rows);
    }
});  

//Route to handle login Post Request Call
app.post('/login', function (req, res) {
    console.log("Inside Login Post Request");
    const { username, password } = req.body;

    // Sanitize input
    if (!validator.isLength(username, { min: 3 })) {
        return res.status(400).send("Invalid username");
    }
    if (!validator.isLength(password, { min: 3 })) { // allow short passwords for now
        return res.status(400).send("Password too short");
    }

    pool.query('SELECT * FROM admin WHERE username = ?', [username], async function (err, rows) {
        if (err) {
            console.error("DB Error", err);
            return res.status(500).send("Server error");
        }

        if (rows.length === 0) {
            return res.status(401).send("Invalid credentials");
        }

        const user = rows[0];
        const match = await bcrypt.compare(password, user.password);

        if (match) {
            res.cookie('cookie', "admin", { maxAge: 900000, httpOnly: false, path: '/' });
            req.session.user = user.username;
            console.log("✅ Login successful");
            res.status(200).send("Successful Login");
        } else {
            console.log("❌ Wrong password");
            res.status(401).send("Invalid credentials");
        }
    });
});


//Route to add Users
app.post('/create', function(req,res){
    console.log("In Create Post");
    if(req.session.user){
        const { Name, StudentID, Department } = req.body;

// Sanitize inputs
if (!validator.isLength(Name, { min: 2 })) {
    return res.status(400).send("Invalid name");
}
if (!validator.isAlphanumeric(StudentID)) {
    return res.status(400).send("Invalid student ID");
}
if (!validator.isLength(Department, { min: 2 })) {
    return res.status(400).send("Invalid department");
}

        console.log("Req Body : ", req.body);
        var userData = {"name": req.body.Name, "studentID": req.body.StudentID, "department" : req.body.Department};
        
        pool.query('INSERT INTO user SET ?',userData, function (err) {
            if (err) {
                console.log("unable to insert into database");
                res.status(400).send("unable to insert into database");
            } else {
                console.log("User Added Successfully!!!!");
                res.writeHead(200,{
                    'Content-Type' : 'text/plain'
                })
                res.end("User Added");
            }
        });
    } else {
        console.log("Session Invalid");
        res.writeHead(400,{
            'Content-Type' : 'text/plain'
        })
        res.end("Session Invalid");
    }
});

//Route to get All users when user visits the Report Page
app.get('/list', function(req,res){
    console.log("Inside list users Login");
    pool.query('SELECT * FROM user', (err, result) => {
    if (err){
      console.log(err);
      res.status(400).send("Error in Connection");
    }else {
        console.log("users list: ",JSON.stringify(result));
        res.writeHead(200,{
            'Content-Type' : 'text/plain'
        })
        res.end(JSON.stringify(result));
     }
  })
})

//Route to delete an user
app.delete('/delete/:id', verifyToken, function(req,res){
    console.log("In Delete Post");
    console.log("The user to be deleted is ", req.params.id);
    const studentID = req.params.id;

if (!validator.isAlphanumeric(studentID)) {
    console.log("❌ Invalid student ID");
    return res.status(400).send("Invalid student ID");
}

    
    pool.query('DELETE FROM user where studentID = ?', [req.params.id], (err, rows) => {
        if (err){
          console.log("User Not Found");
            res.writeHead(400,{
            'Content-Type' : 'text/plain'
        })
            res.end("User not found");
        } else {
            console.log("User ID " + req.params.id + " was removed successfully");
            pool.query('SELECT * FROM user', (err, result) => {
                if (err){
                  console.log(err);
                  res.status(400).send("Error in Connection");
                }else {
                    console.log("users list: ",JSON.stringify(result));
                    res.writeHead(200,{
                        'Content-Type' : 'text/plain'
                    })
                    res.end(JSON.stringify(result));
                 }
            })
         }
      })
});

//start your server on port 5001
app.listen(5001);
console.log("Server Listening on port 5001");