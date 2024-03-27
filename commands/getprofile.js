const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const noblox = require('noblox.js');
const fs = require('fs');

// Load the users.json file directly as a JavaScript object
async function readUsers() {
    try {
        const data = await fs.promises.readFile('users.json', 'utf8');
        const usersObject = JSON.parse(data);
        // Convert the object into an array of user objects
        const usersArray = Object.values(usersObject);
        return usersArray;
    } catch (err) {
        console.error('Error reading users.json:', err);
        return [];
    }
}
   

module.exports = {
    data: new SlashCommandBuilder()
        .setName('getprofile')
        .setDescription('link your account with the bot'),

        async execute(interaction) {
            try {
                // Load users from users.json
                const users = await readUsers();
            
                // Filter the users array to find the user object based on the interaction's user ID
                const userInfo = users.filter(user => user.discordId === interaction.user.id)[0];
            
                if (!userInfo) {
                    console.error('User not found in users.json');
                    return;
                }
            
                // Use the cookie and UserId from the userInfo object
                const { cookie, userID } = userInfo;
            
                // Set the cookie and get player info
                await noblox.setCookie(cookie);
                const user = await noblox.getPlayerInfo({ userId: userID });
                const user2 = await noblox.getCurrentUser()
                console.log(user);
                function hexToDecimal(hex) {
                    return parseInt(hex.replace("#", ""), 16);
                }
                // Get the player's profile picture
                const thumbnailResponse = await noblox.getPlayerThumbnail(userID, 720, "png", true, "Headshot");
                const thumbnail_circHeadshot = thumbnailResponse[0].imageUrl;
                const color = hexToDecimal('#0099ff');
                
                // Create an embed message with enhanced features
                const embed = new EmbedBuilder()
                    .setColor(color)
                    .setTitle(`${user.username}'s Profile`) // More descriptive title
                    .setDescription(`Here's a quick overview of ${user.username}'s Roblox profile.`) // Add a description
                    .setURL(`https://www.roblox.com/users/${userID}/profile`)
                    .setThumbnail(thumbnailResponse[0].imageUrl)
                    .addFields(
                        { name: 'User ID', value: userID.toString(), inline: true },
                        { name: 'Followers', value: user.followingCount.toString(), inline: true },
                        { name: 'Join Date', value: new Date(user.joinDate).toLocaleDateString(), inline: true },
                        { name: 'Robux', value: user2.RobuxBalance.toString(), inline: true },
                        { name: 'Description', value: user.blurb || 'No blurb available', inline: false }
                    )
                    .setTimestamp() // Add a timestamp for when the embed was created
                    .setFooter({ text: 'Roblox Profile Information', iconURL: thumbnailResponse[0].imageUrl }); // Add a footer with an icon
                
                // Reply with the embed message
                await interaction.reply({ embeds: [embed], ephemeral: true });
            } catch (error) {
                console.error('Error performing login:', error);
                // Reply with an ephemeral error message
                await interaction.reply({ content: 'Error performing login.', ephemeral: true });
            }
        }
};