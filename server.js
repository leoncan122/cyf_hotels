const express = require("express");
require('dotenv').config()
const app = express();
const { Pool } = require("pg");

app.use(express.urlencoded({ extended: true })); 
app.use(express.json())

const insertHotel = `INSERT INTO hotels (name, rooms, postcode) VALUES ($1, $2, $3)`
const selectedHotel = `SELECT name FROM hotels WHERE name = $1`
const updateHotel = `UPDATE hotels SET name = $1, rooms = $2, postcode = $3 WHERE id = $4`
const deleteHotel = `DELETE FROM hotels WHERE id = $1`
const deleteBookings = `DELETE FROM bookings WHERE hotel_id = $1`

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "cyf_hotels",
  password: process.env.PGPASSW,
  port: 5432,
});

app.get("/hotels", function (req, res) {
  pool.connect( (err, client, release) => {
      if (err) {
          console.log('Error acquiring client', err.stack)
      }
      
      client.query( 'SELECT * FROM hotels', (err, result) => {
          release();
          if (err) {
              return console.log('Error excecuting query', err.stack)
          }
          res.json(result.rows)
      })
  })
});

app.post("/hotels", function (req, res) {
    let {name, rooms, postcode} = req.body;
    const values = [name, rooms, postcode];
    
    pool.connect( (err, client, release) => {
        if (err) {
            console.log('Error acquiring client', err.stack)
        }

        client.query( selectedHotel, [name], (err, result) => {
            if (result.rowCount > 0 ) {
                res.send('This hotel already exist')
            } else {
                client.query( insertHotel, values, (err, result) => {
                    release();
                    if (err) {
                        return console.log('Error excecuting query', err.stack)
                    }
                    
                    res.send(result.rows)
                })
            }
        })
        
        
        
    })
})
app.put('/hotels', (req, res) => {
    const {name, rooms, postcode, id} = req.body;
    const values = [name, rooms, postcode, id];

    pool.connect( (err, client, release) => {
        if (err) {
            console.log('Error acquiring client', err.stack)
        }

        client.query( updateHotel, values, (err, result) => {
            release()
            if (result.rowCount > 0) {
                return res.status(201).send("Hotel updated")
            } else {
                return res.status(404).send("Hotel not found")
            }
            
        })
    })

})
app.delete('/hotels/:id', function (req, res)  {
    const hotelId = parseInt(req.params.id)

    pool.connect( (err, client, release) => {
        if (err) {
            console.log('Error acquiring client', err.stack)
        }
        client.query( deleteBookings, [hotelId], (err, result) => {
           
            client.query( deleteHotel, [hotelId], (err, result) => {
               
                
                if (result.rowCount > 0) {
                    return res.status(201).send("Hotel deleted")
                } else {
                    return res.status(404).send("Hotel not found")
                }
            })
           
        })
    })
})
app.listen(3000, function () {
  console.log("Server is listening on port 3000. Ready to accept requests!");
});