const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser')
const fs = require('fs');
const cookieParser = require('cookie-parser')
const session = require('express-session')
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 6789;
const ip = require('ip');


// directorul 'views' va conține fișierele .ejs (html + js executat la server)
app.set('view engine', 'ejs');
// suport pentru layout-uri - implicit fișierul care reprezintă template-ul site-ului
//este views/layout.ejs
app.use(expressLayouts);
// directorul 'public' va conține toate resursele accesibile direct de către client
//(e.g., fișiere css, javascript, imagini)
app.use(express.static('public'))
// corpul mesajului poate fi interpretat ca json; datele de la formular se găsesc în
//format json în req.body
app.use(bodyParser.json());
// utilizarea unui algoritm de deep parsing care suportă obiecte în obiecte
app.use(bodyParser.urlencoded({ extended: true }));
// la accesarea din browser adresei http://localhost:6789/ se va returna textul 'Hello
//World'
// proprietățile obiectului Request - req - https://expressjs.com/en/api.html#req
// proprietățile obiectului Response - res - https://expressjs.com/en/api.html#res
app.use(cookieParser());

// la accesarea din browser adresei http://localhost:6789/chestionar se va apela funcția
//specificată
app.use(session({
  secret: 'toys',
  resave: false,
  cookie: {
    maxAge: 120 * 1000
  },
  saveUninitialized: true
}))

var listaIntrebari;



app.use((req, res, next) => {
  let requestedResource = req.originalUrl;
  console.log(ip.address())

  var resurse = ["/", "/chestionar", "/rezultat-chestionar", "/adaugare-produs", "/autentificare", "/logout", "/verificare-autentificare",
    "/creare-bd", "/inserare-bd", "/adaugare-cos", "/vizualizare-cos","/images/back1.jpg","/eliminare-produs"]
  var requestOK = false;
  //requestedResource=requestedResource.replace("?","")
  if (requestedResource[requestedResource.length - 1] == "?") {
    requestedResource = requestedResource.slice(0, -1);
  }
  console.log(requestedResource)

  if (resurse.includes(requestedResource)) {
    requestOK = true;
  }

  if (!requestOK) {
    const clientIP = ip.address();

    // Block the IP by adding it to the session blacklist
    req.session.blacklist = req.session.blacklist || [];

    if (!req.session.blacklist.includes(clientIP)) {
      req.session.blacklist.push(clientIP);
      req.session.cookie.maxAge = 10000; // 
      //req.session.save();
    }

    console.log(req.session.blacklist)
    return res.status(404).send('<h3>Not Found</h3>');
  }
  else if (req.session.blacklist && req.session.blacklist.includes(ip.address())) {
    return res.status(403).send('<h3>Hello there, you\'ve been blocked</h3>');
  }


  next();
});



app.get('/chestionar', (req, res) => {
  fs.readFile('intrebari.json', (err, data) => {
    if (err) throw err;
    listaIntrebari = JSON.parse(data);
    console.log(listaIntrebari[0].corect)
    res.render('chestionar', { intrebari: listaIntrebari });
  });
});

app.post('/rezultat-chestionar', (req, res) => {
  var count = 0;
  for (var i = 0; i < Object.keys(req.body).length; i++) {
    let index = Object.keys(req.body)[i].replace("q", ""); //keys

    if (listaIntrebari[index].corect == req.body[Object.keys(req.body)[i]]) { //values
      count++;
    }
  }

  res.render('rezultat-chestionar', { nrRaspunsuri: count })
});

app.get('/', (req, res) => {

  db = new sqlite3.Database('cumparaturi.db', (err) => { if (err) { console.error(err.message); } });


  if (req.session.admin == true) {
    db.serialize(() => {
      db.exec('CREATE TABLE IF NOT EXISTS PRODUSE (ID INTEGER PRIMARY KEY AUTOINCREMENT, NUME_PRODUS TEXT UNIQUE, PRET NUMBER);', (err) => { })
      let quer = db.prepare('SELECT ID, NUME_PRODUS, PRET FROM PRODUSE;')
      quer.all((err, rows) => {
        if (err) { console.log(err); }
        res.render('admin', {  produse: rows })
      })
    })
  }
  else {
    db.serialize(() => {
      db.exec('CREATE TABLE IF NOT EXISTS PRODUSE (ID INTEGER PRIMARY KEY AUTOINCREMENT, NUME_PRODUS TEXT UNIQUE, PRET NUMBER);', (err) => { })
      let quer = db.prepare('SELECT ID, NUME_PRODUS, PRET FROM PRODUSE;')
      quer.all((err, rows) => {
        if (err) { console.log(err); }

        res.render('index', { user: req.session.user, produse: rows })
      })
    })
  }
  db.close((err) => {
    if (err) { return console.error(err.message); }
    console.log('Close the database connection.');
  })
  //res.render('index', {user: req.session.user});    
});

app.post('/adaugare-produs', (req, res) => {
  db = new sqlite3.Database('cumparaturi.db', (err) => { if (err) console.log(err); })


  db.serialize(() => {
    const produs = SanitizedString(req.body['produs'])
    const pret = parseInt(req.body['pret']);

    let quer = db.prepare("INSERT INTO PRODUSE(NUME_PRODUS,PRET) VALUES(?,?)", [produs, pret])
    quer.run()
    quer.finalize((err) => { if (err) { console.log(err); } })

  })

  db.close((err) => {
    if (err) { return console.error(err.message); }
    console.log('Close the database connection.');
  })

  res.redirect('/')


})

app.post('/eliminare-produs', (req, res) => {
  db = new sqlite3.Database('cumparaturi.db', (err) => { if (err) console.log(err); })


  db.serialize(() => {
    const produs = SanitizedString(req.body['produs'])
   console.log(produs)

    let quer = db.prepare("DELETE FROM PRODUSE WHERE NUME_PRODUS=(?)", [produs])
    quer.run()
    quer.finalize((err) => { if (err) { console.log(err); } })

  })

  db.close((err) => {
    if (err) { return console.error(err.message); }
    console.log('Close the database connection.');
  })

  res.redirect('/')


})

function SanitizedString(resursa) {
  if (resursa.includes(' OR 1=1 ') || resursa.includes(" FROM ") || resursa.includes(" from ") || resursa.includes(" or 1=1 ")) {
    let sanitized = resursa.replace("OR 1=1", "").replace("FROM", "").replace("from", "").replace("or 1=1")
    return sanitized
  }
  return resursa
}


app.get('/autentificare', (req, res) => {
  console.log(req.cookies)

  res.cookie('mesajEroare', '', { overwrite: true })
  res.render('autentificare', { error: req.cookies.mesajEroare });

});

app.get('/logout', (req, res) => {
  req.session.user = null;
  req.session.admin = null;
  res.redirect('/')
})

var failedAttempts = {};
app.post('/verificare-autentificare', (req, res) => {

  var utilizatori;
  console.log(req.body)
  fs.readFile('utilizatori.json', (err, data) => {
    if (err) throw err;
    utilizatori = JSON.parse(data);

    req.body['username'] = SanitizedString(req.body['username'])
    req.body['password'] = SanitizedString(req.body['password'])

    var logat = false;

    for (i in utilizatori) {

      if (req.body['username'] == utilizatori[i].utilizator && req.body['password'] == utilizatori[i].parola) {
        if (utilizatori[i].status == 'admin') {
          req.session.admin = true;
        }
        else {
          req.session.admin = false;
        }
        res.cookie('utilizator', req.body['username'])
        req.session.user = req.body['username'] //aici era  res.cookie('utilizator', req.body['username'])
        logat = true;
        res.redirect('/')
        break;
      }
    }
    if (logat == false) {
      const username = req.body['username']
      const clientIP = req.ip;

      if (failedAttempts[username] && failedAttempts[username].ips == clientIP) {
        console.log(failedAttempts)

        failedAttempts[username].count++;

        if (failedAttempts[username].count === 3) {
          req.session.blacklist = req.session.blacklist || [];
          req.session.blacklist.push(clientIP);
          req.session.cookie.maxAge = 10000;
          failedAttempts[username].count = 0
          res.status(403).send('<h3>Hello there, you\'ve been blocked</h3>');
        }
        else {
          console.log("Utilizatorul nu exista")
          res.cookie('mesajEroare', 'Date gresite', { overwrite: true })
          res.redirect('autentificare')
        }
      }
      else {

        failedAttempts[username] = { count: 1, ips: [clientIP] };
        console.log("Utilizatorul nu exista")
        console.log(failedAttempts)

        res.cookie('mesajEroare', 'Date gresite', { overwrite: true })

        res.redirect('autentificare')
      }

    }

  });

});

var db;
app.get('/creare-bd', (req, res) => {
  db = new sqlite3.Database('cumparaturi.db', (err) => { if (err) { console.error(err.message); } });
  db.serialize(() => { db.exec('CREATE TABLE IF NOT EXISTS PRODUSE(ID INTEGER PRIMARY KEY AUTOINCREMENT, NUME_PRODUS TEXT UNIQUE, PRET NUMBER);', (err) => { }) });

  db.close((err) => {
    if (err) { return console.error(err.message); }
    console.log('Close the database connection.');
  })

  res.redirect('/')
});


app.get('/inserare-bd', (req, res) => {
  db = new sqlite3.Database('cumparaturi.db', sqlite3.OPEN_READWRITE, (err) => { if (err) { console.error(err.message); } });

  var prods=[['Masina-tx30 cu telecomanda',30],['Figurina Batman','50'],['Sabie-lemn-ascutita', '7'],['Ursulet de plus', '10'],['Cub rubik', '9'],['Kendama', '19'],['Avion fara motor', '30']];

  for( i in prods){
    console.log(prods[i][0], prods[i][1])

    let quer = db.prepare("INSERT INTO PRODUSE (NUME_PRODUS,PRET) VALUES(?,?)", [prods[i][0] ,prods[i][1] ])
    quer.run((err) => {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
          console.log('Element duplicat');
        } else {
          console.log(err);
        }
      } else {
        console.log('Data inserted successfully.');
      }
      quer.finalize((err) => {
        if (err) {
          console.log(err);
        }
      });
    });
  }
 
  db.close((err) => {
    if (err) { return console.error(err.message); }
    console.log('Close the database connection.');
  })

  res.redirect('/')
});


app.post('/adaugare-cos', (req, res) => {
  if (req.session.produse) {
    req.session.produse[req.session.produse.length] = req.body['id']
    console.log(req.session.produse);
    res.redirect('/')
  }
  else {
    req.session.produse = []
    req.session.produse[req.session.produse.length] = req.body['id']
    console.log(req.session.produse);
    res.redirect('/')
  }
})

app.get('/vizualizare-cos', (req, res) => {
  db = new sqlite3.Database('cumparaturi.db')
  db.serialize(() => {
    let quer = db.prepare('SELECT * FROM PRODUSE;')
    quer.all((err, rows) => {
      if (err) {
        console.log(err);
      }
      let elems = []
      rows.forEach(row => {
        if (req.session.produse) {
          if (req.session.produse.includes(String(row.ID))) {
            elems[elems.length] = row
          }
        }
      });

      res.render('vizualizare-cos', { user: req.session.user, elemente: elems })
    })

  })
});


app.listen(port, () => console.log(`Serverul rulează la adresa http://localhost:`));