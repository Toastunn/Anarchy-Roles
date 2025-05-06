const { Client, IntentsBitField, Events } = require('discord.js');
const { env } = require('../env');
const { initialCR } = require('./commands/registerCommands');
const { cosmeticRoleRegistry } = require('./roles/cosmeticRoleRegistry');
const { commandRegistry } = require('./commands/commandRegistry');

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ]
});


client.once(Events.ClientReady, async () => {
  console.log('Bot is online!');
  await cosmeticRoleRegistry.update(client);
  await initialCR();
});

client.on('roleCreate', (role) => {
  cosmeticRoleRegistry.update(client);
})

client.on('roleDelete', (role) => {
  cosmeticRoleRegistry.update(client);
  
})

client.on('roleUpdate', (role) => {
  cosmeticRoleRegistry.update(client);

})

client.on(Events.InteractionCreate, (interaction) => {
  if(!interaction.isChatInputCommand()) return;

  commandRegistry.getAllCommands().forEach(command => {
    if(command.name == interaction.commandName) {
      command.callback(interaction)
    }
  })
})

client.login(env.token);