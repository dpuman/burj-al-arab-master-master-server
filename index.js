const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
var admin = require("firebase-admin");
var serviceAccount = require("./components/burj-al-arab-dipu-firebase-adminsdk-4svn2-37bac00667.json");

const app = express()
app.use(cors())
app.use(bodyParser.json())
const port = 5000
const { MongoClient } = require('mongodb');

require('dotenv').config()

console.log(process.env.DB_USER)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5w83p.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



client.connect(err => {
  const bookings = client.db("burjAlArab").collection("bookings");
  // perform actions on the collection object
  console.log('connection sucessful');
  app.post('/add-booking',(req,res)=>{
    const newBooking=req.body
    // console.log(newBooking)
    bookings.insertOne(newBooking)
        .then(result=>{
          // console.log(result)
          res.send(result.acknowledged)
        })
  })

app.get('/bookings',(req,res)=>{
    // console.log(req.headers.authorization)

    const bearer = req.headers.authorization;
    if(bearer && bearer.startsWith('Bearer ')){
        const idToken =bearer.split(' ')[1]
        // console.log({idToken})
        admin.auth().verifyIdToken(idToken)
        .then((decodedToken) => {
        const tokenEmail = decodedToken.email;
        // console.log(tokenEmail,req.query.email)
            if(tokenEmail ==req.query.email){
                bookings.find({email:req.query.email})
                .toArray((err,documents)=>{
                res.send(documents)
                })
            }
            else{
                        res.status(401).send('un-authorized Access')

            }
  })
  .catch((error) => {
            res.status(401).send('un-authorized Access')

  });
    }
    else{
        res.status(401).send('un-authorized Access')
    }




})


});



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port)