const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/auth/index");
const fs = require("fs");
const jobRoutes = require("./routes/jobs/index")
const authMiddleware = require("./middleware/auth")
const cors= require("cors")

app.use(cors({
  origin: "http://localhost:3000",
  Credentials:true
}))
app.use(bodyParser.json());
app.use(express.json());
const PORT = process.env.PORT || 3000;

//MIDDLEWARES
//log every incomung request
app.use((req, res, next) => {
  const log = `${req.method} - ${req.url} - ${req.ip} - ${new Date()}`;
  fs.appendFile("log.txt", log + "\n", (err) => {
    if (err) {
      console.error(err);
    }
  });
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/jobs", authMiddleware, jobRoutes);
app.get("/", (req, res) => {
  res.send("Hello World");
});

//error handling middleware
app.use((err, req, res, next) => {
  let log;
  log = err.stack;
  log += `/n${req.method} - ${req.url} - ${req.ip} - ${new Date()}`;
  fs.appendFile("error.txt", log, (err) => {
    if (err) {
      console.log(err);
    }
  });
  res.status(500).send("something Went Wrong")
});

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
  mongoose
    .connect(
      "mongodb+srv://ashwinshipalkar1:kUeX9FXsch4sXAQj@jobport.1h843.mongodb.net/?retryWrites=true&w=majority&appName=jobPort"
    )
    .then(() => {
      console.log("connected to database");
    })
    .catch((err) => {
      console.log(err);
    });
});
