//  Dependencies
const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const exphbs = require("express-handlebars")

// Database Models
// const db = require("./models")

// const cheerio = require("cheerios")
// const axios = require("axios")

const PORT = process.env.PORT || 3000

// express
const app = express()

// Body Parser
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(express.static("public"))


// Handlebars
app.engine("handlebars", exphbs({ defaultLayout: "main" }))
app.set("view engine", "handlebars")

// routes
require("./routes/route")(app)

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines"
mongoose.set('useCreateIndex', true)
mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
    .catch(err => console.log(err))

app.listen(PORT, () => {
    console.log(`PORT: ${PORT} if on localhost --> http://localhost:${PORT}`)
})