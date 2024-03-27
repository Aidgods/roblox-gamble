const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require('@discordjs/builders');
const { Client, Collection, GatewayIntentBits, } = require('discord.js');
const noblox = require('noblox.js');
const fs = require('fs');
const fetch = require('node-fetch'); // Import node-fetch
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
// Load the users.json file directly as a JavaScript object
async function readUsers() {
    try {
        const data = await fs.promises.readFile('users.json', 'utf8');
        const usersObject = JSON.parse(data);
        const usersArray = Object.values(usersObject);
        return usersArray;
    } catch (err) {
        console.error('Error reading users.json:', err);
        return [];
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('bet')
        .addIntegerOption(option => 
            option.setName('robux')
            .setDescription('amount of robux you want to bet')
            .setRequired(true)
            .setMinValue(10)),
    async execute(interaction) {
        try {
            const users = await readUsers();
            const userInfo = users.filter(user => user.discordId === interaction.user.id)[0];

            if (!userInfo) {
                console.error('User not found in users.json');
                return;
            }

            const { cookie, userID } = userInfo;
            await noblox.setCookie(cookie);

            // Fetch the current user's information
            const user2 = await noblox.getCurrentUser();
            
            // Retrieve the bet amount from the interaction options
            const robux = interaction.options.getInteger('robux');
            
            // Check if the user has enough Robux
            if (robux > user2.RobuxBalance) {
                await interaction.reply({ content: "You do not have enough Robux to place this bet.", ephemeral: true });
                return;
            }

            // Fetch the user's games from Roblox API
            const response = await fetch(`https://games.roblox.com/v2/users/${userID}/games`);
            if (!response.ok) {
                throw new Error(`Failed to fetch games: ${response.statusText}`);
            }
            const games = await response.json();
            
            // Extract the rootPlace ID from the first game in the data array
            const rootPlaceId = games.data[0].rootPlace.id;
            
            console.log(rootPlaceId); // This will log the ID of the rootPlace of the first game
            const response2 = await fetch(`https://apis.roblox.com/universes/v1/places/${rootPlaceId}/universe`);
            if (!response2.ok) {
                throw new Error(`Failed to fetch games: ${response2.statusText}`);
            }
            const games2 = await response2.json();
            
            // Extract the rootPlace ID from the first game in the data array
            const rootPlaceId2 = games2.universeId;
            
            console.log(rootPlaceId2); // This will log the ID of the rootPlace of the first game
            await noblox.setCookie(cookie);
            const buying = await noblox.addDeveloperProduct(rootPlaceId2, "yes", robux, "A cool item.")
            console.log(buying)
            const embed = new EmbedBuilder()
                .setTitle('Coinflip Game')
                .setDescription('Choose your side for the coinflip.');

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('coinflip_heads')
                        .setLabel('Heads')
                        .setStyle('Primary'),
                    new ButtonBuilder()
                        .setCustomId('coinflip_tails')
                        .setLabel('Tails')
                        .setStyle('Secondary')
                );

            await interaction.reply({ embeds: [embed], components: [row], ephemeral: false });
        } catch (error) {
            console.error('Error performing login:', error);
            await interaction.reply({ content: 'Error performing login.', ephemeral: true });
        }
    }
};

// Place this outside of the module.exports object, in the main bot file
client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'coinflip_heads') {
        // Implement logic for when the user clicks "Heads"
    } else if (interaction.customId === 'coinflip_tails') {
        // Implement logic for when the user clicks "Tails"
    }
});


