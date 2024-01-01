const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoDBStore = require('connect-mongo');

const app = express();
const PORT = process.env.PORT||3000;
const User = require("./models/userModel"); 

//Global variables
app.locals.users = {};
app.locals.order = {};


const store = new MongoDBStore({
    mongoUrl: 'mongodb://localhost/a4',
    collection: 'session'
});

app.set("views");
app.set('view engine', 'pug');
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(session({
    name: 'a4-session',
    secret: 'some secret key here',
    cookie:{
        maxAge: 1000*60*60*24*7
    },
    store: store,
    resave: true,
    saveUninitialized: false
}));

//log request received
app.use(function(req,res,next){
    console.log(`${req.method} for ${req.url}`);
    next();
});

app.use(exposeSession);
app.get(['/', '/home'], (req,res) => res.render('home'));
app.get('/login', (req, res) => res.render('login'));
app.post('/login', login);
app.get('/logout', logout);
app.get('/registration', doRegistration);
app.post('/registration', registration);
app.get('/users', auth, sendusers);
app.get ('/users/:userID', auth, sendUser);
app.post ('/users/:userID', auth, updateUser);


function exposeSession(req,res,next){
    if(req.session) res.locals.session = req.session;
    next();
}


function login(req, res, next){
    if(req.session.loggedin){
        return res.status(200).send('Already logged in');
    }

    console.log(req.body);
    const { username, password } = req.body;

    User.findOne({ username: username }).then((user) => { 
        if (user) 
            if(user.password == password){
                req.session.loggedin = true;
                req.session.username = user.username;
                req.session.userid = user._id;
                res.locals.session = req.session;  
                console.log("understand"+res.locals.session);
                res.redirect("/home");
            }else{
                res.redirect("/home");
            }
        else{
            res.redirect("/home");
        }
    });
        
    
    res.status(200);
}

function logout(req,res){
    req.session.destroy();
    delete res.locals.session;
    res.redirect("/home");
}

function doRegistration(req, res){
    res.format({
        'text/html': ()=>{
            res.render('registration', {valid: true})
        }  
    });
}


function registration(req,res){
    console.log(req.body);
    User.findOne({ username: req.body.username }).then((user) => {
        if(user){
            res.render('registration', {valid: false});
        }else{
            const user = new User();
            user.username = req.body.username;
            user.password = req.body.password;
            user.privacy = false;
            user.submission = [];
            user.save((err) => {
                if(err){
                    console.log(err);
                    return res.status(500).send("server problem");
                }
                req.session.loggedin = true;
                req.session.username = user.username;
                req.session.userid = user._id;
                res.redirect("/home");
                return;
            });
        }
    });
}

function auth(req,res,next) {
  
    if (!req.session.loggedin) {
        res.status(401).send("You can't access without logging in.");
    }else{
        next();
    }
}

function sendusers(req, res){
    User.find({}, {_id: 1, username:1, submission:1, privacy: 1})
    .exec(function(err, users){
        if (err){ console.log(err); res.status(500).send('server down');}
        req.app.locals.users = users;
        res.render('users', {users: app.locals.users});
    }) 
}

function sendUser(req,res){
    User.findOne({ _id: req.params.userID}).then((user) => {
        if(user){
            req.user = user;
            console.log(req.user);
            res.format({
                'application/json': ()=>{
                    res.set('Content-Type', 'application/json');
                    res.json(req.user);
                },
                'text/html': ()=>{
                    res.set('Content-Type', 'text/html');
                    res.render('user', { user: req.user });
                },
                'default': ()=>{ res.status(406).send('Not acceptable'); }  
            });

        }else{
                return res.status(404).send('Invalid ID number!!!');
            }
    });
    
}

function updateUser(req, res){
    console.log(Object.values(req.body));

    if(Object.values(req.body) == 'ON'){

        User.findByIdAndUpdate(req.session.userid, { privacy: true }, function (err, docs) {
            if (err){
                console.log(err)
            }
            else{
                res.redirect('/users/'+req.session.userid);
            }
        });
    }else{
        User.findByIdAndUpdate(req.session.userid, { privacy: false }, function (err, docs) {
            if (err){
                console.log(err)
            }
            else{
                res.redirect('/users/'+req.session.userid);
            }
        });
    }
}

mongoose.connect("mongodb://localhost/a4", (err) => {
  if (err) throw err;

  app.listen(PORT);
  console.log(`Listening on port ${PORT}`);
});