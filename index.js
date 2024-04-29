const express = require("express")
const app = express()
const mongoose = require("mongoose")
const cors = require("cors")
const router = express.Router()

const PORT = process.env.PORT || 8080
const MONGODB_URL = "mongodb://localhost:27017/product"
app.use(express.json())
app.use(cors(
    {
        origin : "*"
    }
))

// static files
app.use("/public", express.static(__dirname + "/public"))

const ProductRoute = require("./routes/ProductRoute")
app.use("/", ProductRoute)

mongoose.connect(MONGODB_URL)
    .then(() => {
        console.log(`${MONGODB_URL} connection Successful...`)
    })
    .catch((err) => {
        console.log(`Error in connecting to mongodb`, err.message)
    })


// $env : port = 5000; npm start
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`)
})