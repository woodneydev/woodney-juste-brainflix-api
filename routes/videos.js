const router = require("express").Router();
const fs = require("fs");
const crypto = require("crypto");
const { title } = require("process");
require("dotenv").config();
const {DOMAIN} = process.env

// Helper Functions
const readVideoDetails = (req, res) => {
    let videoDetails = fs.readFileSync("./data/videos.json");
    videoDetails = JSON.parse(videoDetails);
    
    videoDetails = videoDetails.map(video => {
        if (video.image === "http://localhost:8080/0.jpg") {
            return video;
        }
        video.image = `${DOMAIN}/${video.id}.jpeg`
        return video;
    })

    return videoDetails
}

const getVideoDetail = (id) => {
    const videoDetails = readVideoDetails();
    const found = videoDetails.find(video => video.id === id)
    return found;
}

const getVideos = (videoDetailsArr) => {
    const videos = videoDetailsArr.map( ({id, channel, title, image}) => {
        return {id, channel, title, image}
    });
    return videos;
}

const validProperties = [
    "title",
    "description",
    "image"
]


const hasRequiredProperties = (req, res) => {
    const {data = {} } = req.body

    const invalidProperties = Object.keys(data).filter(key => !validProperties.includes(key))

    if (invalidProperties.length > 0) {

        return {hasRequiredProps: false, invalidProperties: `invalid fields ${invalidProperties.join(", ")}`}
        
    } else {
        return {hasRequiredProps: true}
    }
}

const hasValidValues = (req, res) => {
    const { data = {} } =  req.body;

    for (let key in data) {

        if (typeof data[key] !== "string") {
            return false
        }

        if (data[key].length < 1) {
            return false
        }
    }

    return true;
}

const assignId = (length) => {
    return crypto.randomBytes(length).toString("hex");
}

// Router Functions
router.get("/", (req, res) => {
    const videoDetails = readVideoDetails();
    const videos = getVideos(videoDetails);
    res.status(200).json(videos);
})
.post("/", (req, res) => {
    const propCheck = hasRequiredProperties(req, res);
    const valueCheck = hasValidValues(req, res);

    if (propCheck.hasRequiredProps === false) {
        res.status(400).json({error: propCheck.invalidProperties})
    } else if (valueCheck === false) {
        res.status(400).json({error: "Fields must contain greater than 1 character"})
    } else {
        const videoDetails = readVideoDetails()
        
        const date = new Date()
        const mm = (date.getMonth() + 1).toString().padStart(2, "0")
        const dd = date.getDate().toString().padStart(2, "0")
        const yyyy = date.getFullYear();

        const postVideoObj = {
            ...req.body.data, 
            id: `${assignId(4)}-${assignId(2)}-${assignId(2)}-${assignId(6)}`, 
            channel: "Anonymous",
            views: "0",
            likes: "0",
            duration: "---",
            video: " ",
            timestamp: `${mm}/${dd}/${yyyy}`,
            comments: []
        }
        
        videoDetails.push(postVideoObj);
        fs.writeFileSync("./data/videos.json", JSON.stringify(videoDetails))
        res.status(201).json({data: postVideoObj});
    }
})

router.get("/:id", (req, res) => {
    const { id } = req.params
    const videoDetail = getVideoDetail(id)
    res.status(200).json(videoDetail);
})


module.exports = router;