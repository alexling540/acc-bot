/* 
    This command allows users to type $google and copy/paste their search query
    afterwards, and this feature will dispaly the first 10 search results in the channel
*/
let google = require('google')

function sendResults(message){
    google.resultsPerPage = 5
    var nextCounter = 0

    // Split the messages into an empty array

    // TODO: Fix the error here. 
    let query = message.content.split(/[]+/);

    // Join the array back together but without the symbol
    let suffix = query.slice(1).join(' ');

    if(!suffix){
        message.channel.send({
            embed: {
                color: 0xff2727,
                description: `:warning **${message.author.username}**, You did not type any search query.`
            }
        })
    }

    google(suffix, function(err, res){
        // TODO: Re-factor to better error-handling
        if(err){
            console.error(err)
        }

        for(var i = 0; i < res.links.length; ++i){
            var link = res.links[i];
            console.log(link.title + ' - ' + link.href)
            console.log(link.description + "\n")
        }

        if(nextCounter < 4){
            nextCounter += 1
            if(res.next){
                res.next()
            }
        }
    })
}

module.exports = {
    name: "google",
    execute(message, args){
        sendResults(message);
    }
}