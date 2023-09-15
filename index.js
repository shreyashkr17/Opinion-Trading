const express = require("express")
const dotenv = require("dotenv")
const mongoose = require("mongoose")
const app = express();
const cors = require("cors")
dotenv.config();
const uri = process.env.DB_CONNECT;
// console.log(uri)
const PORT = process.env.PORT 


async function run(){
    try{
        const conn = await mongoose.connect(uri,{
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        // .then(() => console.log("MongoDB Connected"))
        console.log("Connected to the database")
    }catch(error){
        console.log(error);
    }
}

run().catch(console.dir);


// Import Routes
const adminRoutes = require("./routes/admin")
const opinionRoutes = require("./routes/opinion")
const userRoutes = require("./routes/user");
const userbidRoutes = require("./routes/UserBid");

// Middlewares
app.use(express.json())
app.use(cors())

// Route Middlewares
app.use("/api/admin",adminRoutes)
app.use("/api/opinions",opinionRoutes)
app.use("/api/users", userRoutes);
app.use("/api/userbid",userbidRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
    // run();
})
