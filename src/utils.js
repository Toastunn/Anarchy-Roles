const { ChatInputCommandInteraction } = require("discord.js")

/**
 * 
 * @param {Array} array 
 * @returns {Array}
 */
exports.isEmpty = (array) => {
  return (array.length == 0 ? [] : array)
}

/**
 * 
 * @param {ChatInputCommandInteraction} interaction 
 * @param {string} optionName 
 */
exports.get = (interaction, optionName) => {
  return interaction.options.get(optionName)?.value
}