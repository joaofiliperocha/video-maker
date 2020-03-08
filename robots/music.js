const state = require("./state");
const axios = require("axios");
const fs = require('fs');
const credentials = require('../credentials/jamedo.json')

async function robot() {
    console.log('> [music-robot] Starting ')
    const content = state.load();
    await getTracksFromFirstSentence(content);

    state.save(content);
}

async function getTracksFromFirstSentence(content) {

    const keyword = content.searchTerm + "+" + content.sentences[0].keywords.join('+');
    // console.log(`> [music-robot] content : ${content}  `)
    // console.log(`> [music-robot] keyword : ${keyword}  `)
    const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${credentials.client_id}&format=jsonpretty&limit=2&order=relevance&search=${keyword}&fuzzytags=pop+rock&include=musicinfo&groupby=artist_id`

    // console.log(`> [music-robot] url : ${url}  `)


    const mp3URL = await axios.get(url)
        .then(function (response) {
            // handle success
            return response.data.results[0].audiodownload;
        })

    if (mp3URL) {
        content.mp3Path = '.\\template\\music.mp3';
        const writer = fs.createWriteStream(content.mp3Path)
        const response = await axios({
            url: mp3URL,
            method: 'GET',
            responseType: 'stream'
        })
        response.data.pipe(writer)

        return new Promise((resolve, reject) => {
            writer.on('finish', resolve)
            writer.on('error', reject)
        })

    }

}

module.exports = robot;