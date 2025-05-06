const { ApplicationCommandOptionType, PermissionsBitField } = require('discord.js');

class Command{
  /**@type {string}*/ name;
  /**@type {string}*/ description;
  /**@type {Option[]} */ options;
  /**@type {Function} */ callback;
  /**@type {PermissionsBitField} */ permissions;

  /**
   * @param {Option[]} options 
   * @param {string} description 
   * @param {string} name  
   * @param {Function} callback 
   * @param {PermissionsBitField} permissions 
   */
  constructor(name, description, options, callback, permissions) {
    this.name = name,
    this.description = description,
    this.options = options ?? [],
    this.permissions = permissions ?? 0 << 0,
    this.callback = callback ?? console.log('Missing command body!')
  }

  format() {
    let /**@type {Option[]}*/ formattedOptions = [];
    this.options.forEach(option => {
      formattedOptions.push(option.format());
    });
    return {
      name: this.name,
      description: this.description,
      options: formattedOptions,
      default_member_permissions: this.permissions,
      callback: this.callback
    }
  }
}

class Option{
  name = 'test'
  description = 'test'
  type = null
  choices = []
  required = false

  /**
   * @param {Choice[]} choices 
   * @param {string} description 
   * @param {string} name 
   * @param {ApplicationCommandOptionType} type 
   */
  constructor(name, description, type, choices, required) {
    this.name = name ?? 'name',
    this.description = description ?? 'test',
    this.type = type ??  null,
    this.choices = choices ?? []
    this.required = required ?? false
  }

  format() {
    let /**@type {Choice[]} */ formattedChoices = [];
    
    this.choices.forEach(choice => {
      formattedChoices.push(choice.format());
    });
    
    return {
      name: this.name,
      description: this.description,
      type: this.type,
      choices: formattedChoices,
      required: this.required
    }
  }
}

class Choice{
  name = 'test';
  value = 1;

  /**
   * 
   * @param {string} name 
   * @param {any} value The type is the same as the `Command` type
   */
  constructor(name, value) {
    this.name = name,
    this.value = value
  }

  format() {
    return {
      name: this.name,
      value: this.value
    }
  }
}

exports.commandHelper = Command;
exports.optionHelper = Option;
exports.choiceHelper = Choice;