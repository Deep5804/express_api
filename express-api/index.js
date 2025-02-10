// const express = require("express");
// const axios = require("axios");
// require("dotenv").config();

// const app = express();
// const PORT = process.env.PORT || 3000;

// // Dummy video and thumbnail URLs (Replace with Pixabay or any other service)
// const DUMMY_VIDEO_URL = "https://cdn.pixabay.com/video/2021/09/13/88481-606110665_large.mp4";
// const DUMMY_THUMBNAIL_URL = "https://cdn.pixabay.com/photo/2022/11/10/20/04/street-7583585_1280.jpg";

// // Middleware to parse JSON
// app.use(express.json());

// // CORS for handling cross-origin requests
// const cors = require("cors");
// app.use(cors());

// // Sample API Route (Similar to the given API)
// app.get("/api/videos", async (req, res) => {
//     try {
//         const { search, page = 1, per_page = 10 } = req.query;

//         // In real case, fetch videos from an API, but here, return dummy data
//         const videos = Array.from({ length: per_page }, (_, index) => ({
//             id: `video_${index + 1}`,
//             title: `Sample Video ${index + 1}`,
//             duration: Math.floor(Math.random() * 600), // Random duration in seconds
//             views: Math.floor(Math.random() * 10000),
//             likes: Math.floor(Math.random() * 1000),
//             thumbnail: DUMMY_THUMBNAIL_URL,
//             video_url: DUMMY_VIDEO_URL,
//         }));

//         res.json({
//             success: true,
//             current_page: page,
//             per_page: per_page,
//             total_videos: 100, // Assume there are 100 videos in total
//             videos,
//         });
//     } catch (error) {
//         res.status(500).json({ success: false, message: "Internal Server Error" });
//     }
// });

// // New Route for fetching video by ID
// app.get("/api/video/id", async (req, res) => {
//     try {
//         const { id } = req.query;
//         if (!id) {
//             return res.status(400).json({ success: false, message: "ID is required" });
//         }

//         const video = {
//             id,
//             title: `Sample Video ${id}`,
//             duration: Math.floor(Math.random() * 600),
//             views: Math.floor(Math.random() * 10000),
//             likes: Math.floor(Math.random() * 1000),
//             thumbnail: DUMMY_THUMBNAIL_URL,
//             video_url: DUMMY_VIDEO_URL,
//         };

//         res.json({ success: true, video });
//     } catch (error) {
//         res.status(500).json({ success: false, message: "Failed to fetch video" });
//     }
// });

// // Start the server
// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });
// //  http://localhost:3000/api/videos
// // http://localhost:3000/api/videos?search=cats&page=1&per_page=5
// // http://localhost:3000/api/video/id?id=video_1


const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY;

app.use(express.json());
app.use(require("cors")());

// Fetch videos from Pixabay
app.get("/api/videos", async (req, res) => {
    try {
        const { search = "nature", page = 1, per_page = 10 } = req.query;

        const response = await axios.get("https://pixabay.com/api/videos/", {
            params: {
                key: PIXABAY_API_KEY,
                q: search,
                page,
                per_page
            }
        });

        // If no videos found
        if (!response.data.hits.length) {
            return res.json({ success: true, videos: [], message: "No videos found." });
        }

        // Transform the response into a cleaner format
        const videos = response.data.hits.map((video) => ({
            id: video.id,
            title: video.tags,
            duration: video.duration, // Duration in seconds
            views: video.views,
            likes: video.likes,
            thumbnail: video.videos.medium.url, // Best thumbnail available
            video_url: video.videos.large.url // High-quality video URL
        }));

        res.json({
            success: true,
            current_page: page,
            per_page: per_page,
            total_videos: response.data.totalHits,
            videos
        });

    } catch (error) {
        console.error("Error fetching videos:", error);
        res.status(500).json({ success: false, message: "Failed to fetch videos" });
    }
});

// Fetch a single video by ID
app.get("/api/video/id", async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ success: false, message: "ID is required" });
        }

        const response = await axios.get("https://pixabay.com/api/videos/", {
            params: {
                key: PIXABAY_API_KEY,
                id
            }
        });

        if (!response.data.hits.length) {
            return res.status(404).json({ success: false, message: "Video not found." });
        }

        const video = response.data.hits[0];

        res.json({
            success: true,
            video: {
                id: video.id,
                title: video.tags,
                duration: video.duration,
                views: video.views,
                likes: video.likes,
                thumbnail: video.videos.medium.url,
                video_url: video.videos.large.url
            }
        });

    } catch (error) {
        console.error("Error fetching video:", error);
        res.status(500).json({ success: false, message: "Failed to fetch video" });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
