const fs = require('fs');

function findLikely(wordList) { // Find most likely words, argument is word list
    let mostList = []; // Array of most found unique characters

    for(let i in wordList) { // Loop through wordlist
        var unique = wordList[i].split('').filter(function(item, i, ar){ return ar.indexOf(item) === i; }).join(''); // Condense to unique characters
        for(let j = 0; j < unique.length; j++) { // Loop through unique string characters
            if( mostList[wordList[i][j]] == undefined ) { // If character index does not exist
                mostList[wordList[i][j]] = 0; // Set character index to 0
            }
            mostList[wordList[i][j]]++; // Increase observed count of that character
            console.log(wordList[i][j])
        }
    }

    let amountCharacters = []; // Amount of unique characters per word

    for(let i in wordList) { // Loop through all possible words
        var unique = wordList[i].split('').filter(function(item, i, ar){ return ar.indexOf(item) === i; }).join(''); // Condense to unique characters
        for(let j = 0; j < unique.length; j++) { // Loop through unique string characters
            if( amountCharacters[wordList[i]] == undefined ) { // If word index does not exist
                amountCharacters[wordList[i]] = 0; // Set word index to 0
            }
            amountCharacters[wordList[i]] += mostList[unique[j]] // Increase the word's unique character weight by the number of instances that the unique character has occured
            console.log(wordList[i],amountCharacters[wordList[i]],mostList[unique[j]]);
        }
        
    }

    const sortable = Object.entries(amountCharacters) // Sort the words by weight
        .sort(([,a],[,b]) => a-b)
        .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});

    console.log("Top 3 choices:\n\t1. " + 
        Object.keys(sortable)[ Object.keys(sortable).length-1 ] + "\n\t2. " + // Highest weight
        Object.keys(sortable)[ Object.keys(sortable).length-2 ] + "\n\t3. " + // Second highest weight
        Object.keys(sortable)[ Object.keys(sortable).length-3 ] // Third highest weight
    )
    
    let all = ""; // String for output
    for(i in sortable) {
        all = all + i + ', '
    }
    console.log("All possible choices: " + all); // Log all possible strings

}

function findWords(words, possLetters, noLetters, constLetters, confirmedNot) { // Possible letters, letter blacklist, confirmed positions, 
    let initialWords = []; // initial word holder
    
    for(let word of words) { // loop through all words
        let constCheck = true; // checker if the placements of constant/confirmed letters are true

        for(let i = 0; i < 5; i++) { // loop through 5 characters
            for(let letter of confirmedNot[i]) { // Loop through confirmed invalid characters
                if (word[i] == letter) { // If character is the same as character in array then break and throw false
                    constCheck = false;
                    break;
                }
            }

            if(constLetters[i] != '0' && constLetters[i] != word[i]) { // If constant character is confirmed in position and not equal to letter
                constCheck = false;
                break;
            }
        }

        if(constCheck == true) { // If checks pass add to initial array
            initialWords.push(word);
        }
    }
    
    let foundWords = [];

    for(let word of initialWords) { // Loop through initial words
        let hasBannedLetter = false; // If character has banned letter
        let possibleLettersFound = 0; // How many possible characters are found

        let tempPossible = possLetters.slice(0); // Slice to clone possible letters into temporary array

        for(let i = 0; i < 5; i++) { // Loop through 5 letters
            if( noLetters.includes(word[i]) ) { // If letter is in blacklist
                hasBannedLetter = true; // Throw has banned check and break
                break;
            }else if( tempPossible.includes(word[i]) ) { // If possible letter is found
                possibleLettersFound++; // Possible letter iterator
                const index = tempPossible.indexOf(word[i]); // Find index from letter value
                if (index > -1) { // If valid index
                    tempPossible.splice(index, 1); // Remove from possible characters
                }
            }
        }

        if(!hasBannedLetter && possibleLettersFound == possLetters.length) { // If doesn't have banned letter and all possible characters are found
            foundWords.push(word); // Add to final array
        }
    }

    for(let word of foundWords) {
        //console.log(word);
    }
    findLikely(foundWords); // Check most likely words from possible word bank

}

function returnPossible(words, word, blacklist) {
    let constLetters = ['0','0','0','0','0']; // constant letters
    let confirmedNot = [ [], [], [], [], [] ]; // letters that are confirmed not at that position
    let possLetters = []; // possible letters
    let noLetters = blacklist.slice(0); // saved letters that are not possible

    for(let i = 0; i < 5; i++) {
        if(word[i][1] == 0) { // Grey
            noLetters.push(word[i][0]);
        }else if (word[i][1] == 1) { // Yellow
            if(!possLetters.includes(word[i][0])) {
                possLetters.push(word[i][0]);
            }

            confirmedNot[i].push(word[i][0])
        }else if (word[i][1] == 2) { // Green
            if(!possLetters.includes(word[i][0])) {
                possLetters.push(word[i][0]);
            }
            
            constLetters[i] = word[i][0];
        }
    }

    findWords(words, possLetters, noLetters, constLetters, confirmedNot)
}

fs.readFile('words.txt', function(err, data) {
    if(err) throw err; // If error happens throw error
    
    const arr = data.toString().replace(/\r\n/g,'\n').split('\n'); // Create array by splitting by newlines
    let words = []; // Word holder
    for(let word of arr) {
        if(word.length == 5) { // If word length = 5 then push to array
            words.push(word);
        }
    }

    let wordSearched = "liver"; // 5 letter word that is searched
    let wordReturn = "02022"; // 0 is grey, 1 is yellow, 2 is green. Example: 20112
    let noLetters = "adusn"; // letter blacklist of old grey letters
    
    let wordArray = [];
    for(let i=0; i<5; i++) {
        wordArray[i] = [];
        wordArray[i][0] = wordSearched.charAt(i);
        wordArray[i][1] = parseInt(wordReturn.charAt(i));
    }

    let noLetterArray = [];
    for(let i=0; i<noLetters.length; i++) {
        noLetterArray[i] = noLetters.charAt(i);
    }
    
    returnPossible(words,wordArray,noLetterArray)
});

// Construct word with
// ['a' = 0, 'b' = 2, 'c' = 0, 'd' = 1]