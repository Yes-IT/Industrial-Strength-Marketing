/**
 * Get youtube video meta data for use in JSON-ld
 */
const EleventyFetch = require("@11ty/eleventy-fetch");

const getYouTubeVideos = async (ids) => {
    let API_KEY = "AIzaSyACP-WWcNM_ai7ETqbnI8gO4JdlQPZosVY";
    let url = `https://www.googleapis.com/youtube/v3/videos?key=${API_KEY}&part=contentDetails,snippet&id=${ids.join(",")}&maxResults=50`;

    let data = await EleventyFetch(url, {
        duration: "1d", 
        type: "json", 
    });

    const item = data.items[0];
    let cleanData = {};
    data.items.map((item) => {
        cleanData[item.id] = {
            duration: item.contentDetails.duration,
            thumbnail: item.snippet.thumbnails.high.url,
            publishedAt: item.snippet.publishedAt
        }
    })
        return cleanData;
};

function initYoutubes() {
    const ids = [];
    let metadata = null;
    let callback = null;
    return function (files, metalsmith, done) {
        metadata = metalsmith.metadata();
        callback = done;
        for (var file in files) {
            if (files[file].youtube_id) {
                ids.push(files[file].youtube_id);
            }
        }
        const promise = getYouTubeVideos(ids);
        promise.then((value) => {
                metadata.videoData =  value;
                callback();
            },
            function (error) {
                console.log(error);
            }
        );
    };
}

module.exports = initYoutubes;
