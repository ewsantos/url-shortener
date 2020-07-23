const express = require('express');
const mysql = require('mysql');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const isUrl = require('is-url');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const randomstring = require('randomstring');
const bodyParser = require('body-parser')
const path = require('path');
const dotenv = require('dotenv').config({
  path: path.resolve(`${__dirname}/../.env`)
})

const app = express();

app.use(helmet());
app.use(morgan('tiny'));
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.use(express.static(path.resolve(`${__dirname}/../client`)))

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
  multipleStatements: true
});



//Shortens Url

app.post('/url', (req, res) => {

  const data = req.body.feilds;
  var slug;

  if (data.slug.length > 0) {
    console.log("slug");
    slug = data.slug.replace("http://", "");
  } else {
    slug = randomstring.generate({
      length: 13,
      charset: 'alphabetic'
    });
  }

  pool.getConnection((err, conn) => {
    if (err) {
      throw err
    }

    conn.query(`SELECT * FROM urls WHERE slug=${conn.escape(slug)}`, (err, rows) => {
      if (err) throw err;

      if (rows.length == 0) {

        conn.query(`INSERT INTO urls (slug, url) VALUES(${conn.escape(slug)}, ${conn.escape(data.url)})`, (err, res) => {
          if (err) throw err;
          console.log("insert into urls");
        })

        res.json(JSON.stringify({
          sh_url: `localhost:3000/${slug}`
        }))


      } else {
        res.send(JSON.stringify({error: `The slug coosen: "${slug}" already exists`}))
      }

    })

    conn.release()

  });

})

app.get('/:slug', (req, res) => {
  //TODO: redirtect to url

  pool.getConnection((err, conn) => {
    if(err) throw err;

    conn.query(`SELECT * FROM urls WHERE slug=${conn.escape(req.params.slug)}`, (err, rows) => {
      if(err) throw err;

      if (rows.length == 1) {console.log(rows);
        res.redirect(`http://${rows[0].url}`)
      }else {
        res.send(`<h3>ERROR 404 Not found</h3>`);
      }

    })
  })
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
})
