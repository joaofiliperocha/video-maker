const readline = require('readline-sync');


function start() {
    const content = {};
    content.searchTerm = askAndReturnSearchTerm();
    content.prefix = askAndReturnPerfix();

    function askAndReturnSearchTerm() {
        return readline.question("Type a Wikipedia search term: ");
    }

    function askAndReturnPerfix() {
        const prefixes = ['Who is', 'What is', 'The history of'];
        const selectedPrefixIndex = readline.keyInSelect(prefixes, "Choose option: ");
        return prefixes[selectedPrefixIndex];
    }

    console.log(content);
}

start();