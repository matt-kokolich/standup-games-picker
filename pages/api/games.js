// pages/api/games.js

const GAMES_LIST = [
    ":earth_asia: <https://worldle.teuteuf.fr/|Worldle>", 
    ":film_frames: <https://framed.wtf/|Framed>",
    ":clapper: <https://www.cinenerdle2.app/|Cine2Nerdle>",
    ":arrows_counterclockwise: <https://www.nytimes.com/games/connections|Connections>",
];

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { text, response_url } = req.body;
        
        // Set default number of games to 2 if no number is provided or if parsing fails
        let numberOfGames = parseInt(text, 10);
        if (isNaN(numberOfGames) || text.trim() === '') {
            numberOfGames = 2;
        }
        // Make sure numberOfGames does not exceed the length of GAMES_LIST
        numberOfGames = Math.min(numberOfGames, GAMES_LIST.length);
        // Make sure numberOfGames is not less than 1
        numberOfGames = Math.max(1, numberOfGames);

        // Randomly choose games from the games list
        const chosen_games = selectRandomGames(GAMES_LIST, numberOfGames);
        const bot_message = createBotMessage(chosen_games);

        // Use Vercel environment variable to store the Slack OAuth token
        const token = process.env.SLACK_OAUTH_TOKEN;

        // Post the games list back to the Slack channel
        await fetch(response_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                blocks: [
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": `${bot_message}`
                        }
                    }
                ],
                response_type: 'in_channel',
            }),
        });

        // Respond to Slack that the command was received
        res.status(200).json({ response_type: 'in_channel' });
    } else {
        // Handle any non-POST requests
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

function selectRandomGames(list, count) {
    // Check if the count is greater than the list length
    if (count > list.length) {
        throw new Error('Count should not be greater than the list length');
    }

    // Create a copy of the list to avoid mutating the original list
    let tempList = [...list];

    let selectedGames = [];
    for (let i = 0; i < count; i++) {
        // Generate a random index
        let randomIndex = Math.floor(Math.random() * tempList.length);

        // Get the game at the random index
        let selectedGame = tempList[randomIndex];

        // Add the selected game to the selectedGames array
        selectedGames.push(selectedGame);

        // Remove the selected game from the tempList
        tempList.splice(randomIndex, 1);
    }

    return selectedGames;
}

function createBotMessage(games) {
    return `Today's standup games are: \n${games.join('\n')}`;
}