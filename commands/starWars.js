/* 
    This is basic, but funny, file where sends a random star wars joke on a user's command
    Essentially, when a user types the keyword 'starwars' call a function that randomly selects a Star Wars joke and displays it to the screen
*/

// TODO: Write functionality that will send a random quote, not joke

function sendJoke(message){

    // Simple list of Star Wars jokes I pulled off 
    const starwarsQuotes = [
        "What's the internal temperature of a Tauntaun?\nLukewarm ",
        "Why did Episodes 4, 5, and 6 come out before 1, 2, and 3?/nBecause in charge of directing, Yoda was.",
        "What did Darth Vader say when he walked into a vegetarian restaurant?\n'I find your lack of steak disturbing.'",
        "How does Wicket get around Endor?\nEwoks.",
        "What do you call five Siths piled on top of a lightsaber?\nA sith-kebab.",
        "Where did Luke get his bionic hand?\nAt the second-hand store.",
        "Where do Gungans store their fruit preserves?\nJar-Jars.",
        "Which program do Jedi use to open PDF files?\nAdobe-Wan Kenobi.",
        "What do you get if you mix a bounty hunter with a tropical fruit?\nMango Fett.",
        "How do Tusken Raiders cheat on their taxes?\nThey always single file, to hide their numbers.",
        "Which Jedi became a rock star?\nBon Jovi-Wan Kenobi."
    ];

    let choice = Math.floor(Math.random() * (starwarsQuotes.length));
    message.channel.send(starwarsQuotes[choice]);
}

module.exports = {
    name: 'starwars',
    execute(message, args){
        sendJoke(message);
    }
};