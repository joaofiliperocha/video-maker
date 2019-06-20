const state = require("./state")
const google = require("googleapis").google;
const imagedownloader = require('image-downloader');
const googleCustomSearch = google.customsearch("v1");
const googleSearchCredentials = require('../credentials/google-search.json');

async function robot() {
    const content = state.load();
    // await fetchGoogleImagesByKeywords(content);
    await downloadAllImages(content)

    //state.save(content);

    async function fetchGoogleImagesByKeywords(content) {
        for (const sentence of content.sentences) {
            //console.log(sentence);
            const query = `${content.searchTerm} ${sentence.keywords[0]}`
            //console.log(query);
            sentence.images = await fetchGoogleImages(query);

            sentence.googleSearchQuery = query;
        }
    }


    async function fetchGoogleImages(query) {
        const response = await googleCustomSearch.cse.list({
            auth: googleSearchCredentials.APIKey,
            cx: googleSearchCredentials.GoogleSarchID,
            q: query,
            searchType: "image",
            imgSize: 'huge',
            num: 2
        });

        const imagesURL = response.data.items.map((items) => {
            return items.link;
        })
        return imagesURL;
    }

    async function downloadAllImages(content) {
        content.downloadedImages = [];

        for (let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++) {
            const images = content.sentences[sentenceIndex].images;
            for (let imageIndex = 0; imageIndex < images.length; imageIndex++) {
                const imageURl = images[imageIndex];
                try {
                    if (!content.downloadedImages.includes(imageURl)) {
                        await downloadAndSaveImage(imageURl, `${sentenceIndex}-original.png`);
                        content.downloadedImages.push(imageURl);
                        break;
                    }
                    console.log(`gravada a imagem ${imageURl}`);
                } catch (error) {
                    console.log(`error:${error}`);
                }

            }

        }

    }

    async function downloadAndSaveImage(url, file) {
        return imagedownloader.image({
            url: url,
            dest: `./content/${file}`
        });
    }

}

module.exports = robot;