const state = require("./state")
const google = require("googleapis").google;
const googleCustomSearch = google.customsearch("v1");
const googleSearchCredentials = require('../credentials/google-search.json');

async function robot() {
    content = state.load();
    await fetchGoogleImagesByKeywords(content);
    state.save(content);

    async function fetchGoogleImagesByKeywords(content) {
        for (const sentence of content.sentences) {
            //console.log(sentence);
            const query = `${content.searchTerm} ${sentence.keywords[0]}`
            //console.log(query);
            sentence.images = await fetchGoogleImages(query);

            sentence.googleSearchQuery = query;
        }
    }

    const imageArray = await fetchGoogleImages("slayer");
    console.dir(imageArray, { depth: null });
    process.exit(0);

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

}

module.exports = robot;