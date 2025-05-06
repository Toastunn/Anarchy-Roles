const { cosmeticRoleRegistry } = require("../roles/cosmeticRoleRegistry");
const { get } = require("../utils");
const { commandHelper, optionHelper, choiceHelper } = require("./commandsHelper")
const { ApplicationCommandOptionType, ChatInputCommandInteraction, MessageFlags, ApplicationCommand, Role } = require('discord.js');

const manageRoles = 1 << 28;
const everyone = 1 << 11;

//comment
class CommandRegistry{
  registry = [
    new commandHelper(
      "createrole", 'Creates a cosmetic role.', [
        new optionHelper('name', 'The name of the role.' , ApplicationCommandOptionType.String),
        new optionHelper('color', 'The color of the role. Type in the hex code for a custom color, ex: `ff02b4`', ApplicationCommandOptionType.String, colorChoiceArray),
        new optionHelper('position', 'The position you want your role to be at. A bigger number means higher in priority.', ApplicationCommandOptionType.Integer)
      ], createRole, everyone
    ),
    new commandHelper(
      "gainrole", "Give yourself a cosmetic role.", [
        new optionHelper("role", "The cosmetic role you want.", ApplicationCommandOptionType.Role, [], true)
      ], giveRole, everyone
    ),
    new commandHelper(
      "conjurerole", "Create and give yourself a cosmetic role.", [
        new optionHelper('name', 'The name of the role.' , ApplicationCommandOptionType.String),
        new optionHelper('color', 'The color of the role.', ApplicationCommandOptionType.String, colorChoiceArray),
        new optionHelper('position', 'The position you want your role to be at. A bigger number means higher in priority.', ApplicationCommandOptionType.Integer)
      ], conjureRole, everyone
    ),
    new commandHelper(
      "deleterole", "Delete a cosmetic role.", [
        new optionHelper("role", "The cosmetic role you want to delete.", ApplicationCommandOptionType.Role, [], true)
      ], deleteRole, manageRoles
    ),
    new commandHelper(
      "editrole", "Modify a cosmetic role.", [
        new optionHelper("role", "The cosmetic role you want to edit. Leave a field empty to not change it.", ApplicationCommandOptionType.Role, [], true),
        new optionHelper('name', 'The new name of the role.' , ApplicationCommandOptionType.String),
        new optionHelper('color', 'The new color of the role.', ApplicationCommandOptionType.String, colorChoiceArray),
        new optionHelper('position', 'The new position you want your role to be at. A bigger number means higher in priority.', ApplicationCommandOptionType.Integer),
        new optionHelper('show-seperately', 'Should this role have its own category in the members list?', ApplicationCommandOptionType.Boolean),
        new optionHelper('mentionable', 'Should you be able to @mention this role?', ApplicationCommandOptionType.Boolean)
      ], editRole, manageRoles
    ),

  ]

  dyn_registry = [
  ]

  constructor() {

  }

  /**
   * @returns {ApplicationCommand[]}
   */
  getAllCommands() {
    let holder = []
    this.registry.forEach(command => {
      holder.push(command.format())
    })
    this.dyn_registry.forEach(command => {
      holder.push(command.format())
    })
    
    return holder
  }
}


//===========FUNCTIONS================


/**
 * 
 * @param {ChatInputCommandInteraction} interaction 
 */
async function giveRole(interaction) {
  try {
    let role = interaction.guild.roles.cache.get(get(interaction, 'role'));
    
    if(role){
      await interaction.deferReply({flags: MessageFlags.Ephemeral});
    } else {
      (await interaction.guild.roles.fetch()).forEach(fetchRole => {
        
        if(fetchRole.name == get(interaction, 'name')) {
          role = fetchRole;
        }
      });
    }
    
    
    if (!role) {
      await interaction.editReply("Mmm, that's not a real role :nerd:");
      return;
    }

    const hasRole = interaction.member.roles.cache.has(role.id);

    if (hasRole) {
      await interaction.editReply(`You already have ${role}.`);
      return;
    }

    if (!role.permissions.equals(0n)) {
      await interaction.editReply(`${role} is not a cosmetic role.`);
      return;
    }

    await interaction.member.roles.add(role);
    await interaction.editReply(`You now have ${role}.`);
    
  } catch (error) {
    console.log(error);
  }
}

/**
 * 
 * @param {ChatInputCommandInteraction} interaction 
 * @returns {Role}
 */
async function createRole(interaction) {
  try {
    await interaction.deferReply({flags: MessageFlags.Ephemeral});

    const pos = positionHandler(interaction);
    const roleName = get(interaction, 'name') ?? 'new role';

    let count = 0; 
    interaction.guild.roles.cache.forEach(role => {
      if(role.name == roleName) count++
    })

    if(count >= 5) {
      await interaction.editReply(`Too many roles already have the name \`${roleName}\`.`);
      return undefined;
    };

    const role = await interaction.guild.roles.create({
      name: roleName,
      color: get(interaction, 'color') ?? 'Default',
      position: pos,
      permissions: 0n
    });
    
    role.rawPosition = pos
    
    await interaction.editReply(`${role} successfully created!`)
    console.log(role.name);
    
    return role
  } catch (error) {
    console.log(error);
  }
}

/**
 * 
 * @param {ChatInputCommandInteraction} interaction 
 * @returns {Role}
 */
async function conjureRole(interaction) {
  const role = await createRole(interaction);
  if(!role) return;
  
  giveRole(interaction);
}

/**
 * 
 * @param {ChatInputCommandInteraction} interaction 
 * @returns {Role}
 */
async function deleteRole(interaction) {
  try {
    await interaction.deferReply({flags: MessageFlags.Ephemeral});

    let role = interaction.guild.roles.cache.get(get(interaction, 'role'));

    await interaction.guild.roles.delete(role)
    
    await interaction.editReply(`\`@${role.name}\` successfully deleted!`)
  } catch (error) {
    console.log(error);
  }
}

/**
 * 
 * @param {ChatInputCommandInteraction} interaction 
 * @returns {Role}
 */
async function editRole(interaction) {
  try {
    await interaction.deferReply({flags: MessageFlags.Ephemeral});
    const pos = positionHandler(interaction);

    const /**@type {Role} */ role = interaction.guild.roles.cache.get(get(interaction, 'role'))
    
    await role.edit({
      name: get(interaction, 'name') ?? role.name,
      color: get(interaction, 'color') ?? role.color,
      position: get(interaction, 'position') ? pos : role.pos,
      hoist: get(interaction, 'show-seperately') ?? role.hoist,
      mentionable: get(interaction, 'mentionable') ?? role.mentionable
    })
    
    role.rawPosition = pos
    
    await interaction.editReply(`${role} successfully edited!`)
    
    return role
  } catch (error) {
    console.log(error);
  }
}


/**
 * 
 * @param {ChatInputCommandInteraction} interaction
 * @returns {number}
 */
function positionHandler(interaction) {
  let posiition = get(interaction, 'position') ?? -1;

  if(posiition == -1 || posiition > cosmeticRoleRegistry.roleRegistry.length) {
    posiition = cosmeticRoleRegistry.roleRegistry.length + 1
  } 
  

  return posiition
}

//===========BEEFY COMMANDS===============

const colorChoiceArray = [
  new choiceHelper('Default', 'Default'),
  new choiceHelper('Aqua', 'Aqua'),
  new choiceHelper('Green', '2ecc71'),
  new choiceHelper('Blue', 'Blue'),
  new choiceHelper('Purple', 'Purple'),
  new choiceHelper('Luminous Vivid Pink', 'LuminousVividPink'),
  new choiceHelper('Gold', 'Gold'),
  new choiceHelper('Orange', 'Orange'),
  new choiceHelper('Not Red', 'e74c3c'),
  new choiceHelper('Grey', 'Grey'),
  new choiceHelper('Dark Aqua', 'DarkAqua'),
  new choiceHelper('Dark Green', 'DarkGreen'),
  new choiceHelper('Dark Blue', 'DarkBlue'),
  new choiceHelper('Dark Purple', 'DarkPurple'),
  new choiceHelper('Dark Vivid Pink', 'DarkVividPink'),
  new choiceHelper('Dark Gold', 'DarkGold'),
  new choiceHelper('Dark Orange', 'DarkOrange'),
  new choiceHelper('Not Dark Red', 'DarkRed'),
  new choiceHelper('Dark Grey', 'DarkGrey'),
  new choiceHelper('Dark Navy', 'DarkNavy'),
]

//----------------
exports.commandRegistry = new CommandRegistry();