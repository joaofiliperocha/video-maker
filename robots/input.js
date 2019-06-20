const state = require('./state');
const readline = require('readline-sync');

function robot() {
    const content = {
        maxSentences: 7
    };


    content.searchTerm = askAndReturnSearchTerm();
    content.prefix = askAndReturnPerfix();
    state.save(content);

    function askAndReturnSearchTerm() {
        return readline.question("Type a Wikipedia search term: ");
    }

    function askAndReturnPerfix() {
        const prefixes = ['Who is', 'What is', 'The history of'];
        const selectedPrefixIndex = readline.keyInSelect(prefixes, "Choose option: ");
        return prefixes[selectedPrefixIndex];
    }



}

module.exports = robot;