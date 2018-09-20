const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;
const config = {
    secret: 'hehehe'
}

function verifyToken(req, res, next) {
    const token = req.headers['x-access-token'];
    if (!token)
      return res.status(403).send({ auth: false, message: 'No token provided.' });
    jwt.verify(token, config.secret, function(err, decoded) {
      if (err)
      return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
      // if everything good, save to request for use in other routes
      req.user = decoded.user;
      next();
    });
  }



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/version', (req, res) => {
    return res.status(200).send({version: '1.0.0'});
});

app.get('/getToken/user/:uid', (req, res) => {

    const token = jwt.sign({ user: req.params.uid }, config.secret, {
        expiresIn: 60 // expires in 1 min
      });

    return res.status(200).send({auth: true, token: token});
});


app.get('/verifyToken', (req, res) => {

    const token = req.headers['x-access-token'];
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
    
    jwt.verify(token, config.secret, function(err, decoded) {
      if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
      
      res.status(200).send(decoded);
    });
});

app.get('/secure/endpoint', verifyToken, (req, res, next) => {

    res.status(200).send(`hey! ${req.user}! You are authenticated`);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))