// pages/api/games.js

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { text, response_url } = req.body;
        const numberOfGames = parseInt(text, 10); // Parse the number from the command text, e.g., "2" from "/games 2"

        // You could have a function to select 'numberOfGames' random games
        const games = selectRandomGames(['A', 'B', 'C'], numberOfGames);

        // Use the SLACK_OAUTH_TOKEN environment variable
        const token = process.env.SLACK_OAUTH_TOKEN;

        // Post the message back to the Slack channel
        await fetch(response_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                text: `Today's standup games are: ${games.join(' and ')}`,
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