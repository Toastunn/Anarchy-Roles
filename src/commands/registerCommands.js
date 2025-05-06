const { REST, Routes } = require('discord.js');
const { env } = require('../../env');
const { commandRegistry } = require('./commandRegistry');

let commandsToRegister = commandRegistry.getAllCommands();

const rest = new REST({version: '10'}).setToken(env.token);

async function initialCR() {
  try {
    console.log('/commands registering...')

    await rest.put(
      Routes.applicationGuildCommands(env.client_id, env.guild_id),
      { body: commandsToRegister }
    )

    console.log('/commands Registered!');
    
  } catch (error) {
    console.log(error)
  }
}

exports.initialCR = initialCR;