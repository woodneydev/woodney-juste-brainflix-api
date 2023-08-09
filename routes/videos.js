const router = require("express").Router();
const fs = require("fs");
const crypto = require("crypto");

// Helper Functions
//explore asynchronous methods
const readVideoDetails = () => {
    let videoDetails = fs.readFileSync("./data/video-details.json");
    videoDetails = JSON.parse(videoDetails);
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
    const videos = getVideos(videoDetails)
    res.status(200).json(videos);
})
.post("/", (req, res) => {
    const propCheck = hasRequiredProperties(req, res);
    const valueCheck = hasValidValues(req, res);

    if (propCheck.hasRequiredProps === false) {
        res.status(400).json({error: propCheck.invalidProperties})
    } else if (valueCheck.hasValidValues === false) {
        res.status(400).json({error: "Fields must contain greater than 1 character"})
    } else {

        res.status(201).json({...req.body.data})
    }
})

router.get("/:id", (req, res) => {
    const { id } = req.params
    const videoDetail = getVideoDetail(id)
    res.status(200).json(videoDetail);
})


module.exports = router