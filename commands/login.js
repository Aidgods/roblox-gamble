const { SlashCommandBuilder } = require('@discordjs/builders');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const noblox = require('noblox.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('login')
        .setDescription('link your account with the bot')
        .addStringOption(option => 
            option.setName('logininfo')
            .setDescription('Enter your login information')
            .setRequired(true)),

    async execute(interaction) {
        const loginInfo = interaction.options.getString('logininfo');

        try {
            // Store the cookie
            const currentUser = await noblox.setCookie(loginInfo);
            const user = await noblox.getCurrentUser();
            console.log(user);

            const userData = {
                discordId: interaction.user.id,
                robloxUsername: currentUser.UserName,
                robuxBalance: currentUser.RobuxBalance, // Assuming 'user.robux' contains the Robux balance
                cookie: loginInfo,
                userID: currentUser.UserID
            };

            // Read existing data
            let existingData = {};
            try {
                existingData = JSON.parse(fs.readFileSync('users.json', 'utf8'));
            } catch (error) {
                console.log('No existing data found.');
            }

            // Update or add new user data
            existingData[interaction.user.id] = userData;

            // Write updated data back to the file
            fs.writeFileSync('users.json', JSON.stringify(existingData, null, 2), (err) => {
                if (err) {
                    console.error('Error writing to file:', err);
                } else {
                    console.log('User data saved successfully.');
                }
            });

            // Reply with an ephemeral message
            await interaction.reply({ content: 'Login successful!', ephemeral: true });
        } catch (error) {
            console.error('Error performing login:', error);
            // Reply with an ephemeral error message
            await interaction.reply({ 
                content: 'Error performing login. Use this extension if you want to get your cookie. [Firefox Extension](https://addons.mozilla.org/en-GB/firefox/addon/edithiscookie/) | [Chrome Extension](https://chromewebstore.google.com/detail/editthiscookie/fngmhnnpilhplaeedifhccceomclgfbg)', 
                ephemeral: true 
            });
            
        }
    }
};
