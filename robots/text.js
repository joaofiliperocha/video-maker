const algorithmia = require('algorithmia');
const algorithmiaAPIKey = require('../credentials/algorithmia.json').apiKey;
const watsonApiKey = require('../credentials/watson-nlu.json').apikey
const sentenceBoundaryDetection = require('sbd');


const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
const nlu = new NaturalLanguageUnderstandingV1({
    iam_apikey: watsonApiKey,
    version: '2018-04-05',
    url: 'https://gateway-lon.watsonplatform.net/natural-language-understanding/api'
})


async function robot(content) {
    await fetchContentFromWikipedia(content);
    sanitizeContent(content);
    breakContentIntoSentences(content);
    limitNumberofSentences(content);
    await fechKeywordAllSentences(content);

    async function fetchContentFromWikipedia(content) {
        const algorithmiaAuthenticated = algorithmia(algorithmiaAPIKey);
        const wikipediaAlgorithm = algorithmiaAuthenticated.algo("web/WikipediaParser/0.1.2");
        const wikipediaResponse = await wikipediaAlgorithm.pipe(content.searchTerm);
        const wikipediaContent = wikipediaResponse.get();
        content.sourceContentOriginal = wikipediaContent.content;
    }

    function sanitizeContent(content) {
        const withoutBlankLinesAndMarkdown = removeBlankLinesAndMarkdown(content.sourceContentOriginal);
        const withoutDatesInsideParentisis = removeDatesInsideParentisis(withoutBlankLinesAndMarkdown);
        content.sourceContentSanitize = withoutDatesInsideParentisis;

        function removeBlankLinesAndMarkdown(text) {
            const allLines = text.split('\n');
            const withoutBlankLinesAndMarkdown = allLines.filter((line) => {
                if (line.trim().length === 0 || line.trim().startsWith('=')) {
                    return false;
                }
                return true;
            })

            return withoutBlankLinesAndMarkdown.join(' ');
        }

        function removeDatesInsideParentisis(text) {
            return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g, ' ')
        }


    }
    function breakContentIntoSentences(content) {
        content.sentences = [];
        const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitize);
        sentences.forEach((sentence) => {
            content.sentences.push({
                text: sentence,
                keywords: [],
                images: []
            })
        })
    }

    function limitNumberofSentences(content) {
        content.sentences = content.sentences.slice(0, content.maxSentences);
    }

    async function fechKeywordAllSentences(content) {
        //console.log('> [text-robot] Starting to fetch keywords from Watson')
        for (const sentence of content.sentences) {
            //console.log(`> [text-robot] Sentence: "${sentence.text}"`)
            sentence.keywords = await fetchWatsonAndReturnKeyWords(sentence.text);
            //console.log(`> [text-robot] Keywords: ${sentence.keywords.join(', ')}\n`)
        }
    }

    async function fetchWatsonAndReturnKeyWords(sentence) {
        return new Promise((resolve, reject) => {
            nlu.analyze({
                text: sentence,
                features: {
                    keywords: {}
                }
            }, (error, response) => {
                if (error)
                    throw error;

                const keywords = response.keywords.map((keyword) => {
                    return keyword.text;
                })

                resolve(keywords);
            })
        })
    }
}

module.exports = robot;