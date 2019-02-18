const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt-nodejs");
const cors = require("cors");
const knex = require('knex')

const db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'ryan',
    password : '',
    database: 'smart-brain'
  }
})

db.select('*').from('users').then(data => {
  console.log(data);
})

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send(db.users);
});

app.post("/signin", (req, res) => {
  if (
    req.body.email === db.users[0].email &&
    req.body.password === db.users[0].password
  ) {
    res.json(db.users[0]);
  } else {
    res.status(400).json("error logging in");
  }
});

app.post("/register", (req, res) => {
  const { email, name, password } = req.body;

  db('users')
    .returning('*')
    .insert({
      email: email,
      name: name,
      joined: new Date()
    })
    .then(user => {
      res.json(user[0]);
    })
    .catch(err => res.status(400).json('unable to register'))
});

app.get("/profile/:id", (req, res) => {
  const { id } = req.params;
  db.select('*').from('users').where({id}) // the property and the value are the same 
  // so you dont need to do id: id
    .then(user => {
      if (user.length) {
        res.json(user[0])
      } else {
        res.status(400).json('User Not Found')
      }
    })
    .catch(err => res.status(400).json('error getting user'))
});

app.put("/image", (req, res) => {
  const { id } = req.body;
  let found = false;
  db.users.forEach(user => {
    if (user.id === id) {
      found = true;
      user.entries++;
      return res.json(user.entries);
    }
  });
  if (!found) {
    res.status(400).json("user not found");
  }
});

app.listen(3000, () => {
  console.log("app is running on port 3000");
});
