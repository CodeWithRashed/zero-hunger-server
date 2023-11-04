//Imports
import express from 'express'
import 'dotenv/config'


//Middleware
const app = express()

//Server Port
const port = process.env.PORT || 3000

//Front End Request Handlers
app.get("/", async (req, res) =>{
    res.send("Welcome to ZeroHunger Server")
})


//Server Initialization
app.listen( port, () =>{
console.log("server is running on port " , port )
})