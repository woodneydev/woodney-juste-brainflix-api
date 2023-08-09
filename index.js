require("dotenv").config();
const express = require("express");
const app = express();
const { PORT } = process.env
const { ORIGIN } = process.env
const cors = require("cors");
const videos = require("./routes/videos");

// app.use(cors({orgin: ORIGIN}))
app.use(cors({orgin: "*"}))

app.use(express.json());

app.use("/videos", videos);

app.listen(PORT, () => {
    console.log("Server is running on port" + PORT);
    console.log("Type CTRL + C to exit");
})