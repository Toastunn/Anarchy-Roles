const {  Client, Role } = require('discord.js');
const { env } = require('../../env');

class CosmeticRoleRegistry{
  /**@type {Role[]} */ roleRegistry = []
  /**@type {number} */ rolesWithPermissions = 0

  constructor() {
  }

  /**
   * 
   * @param {Client} client 
   */
  async update(client) {
    this.roleRegistry = []
    this.rolesWithPermissions = 0

    const server = await client.guilds.fetch(env.guild_id);
    const roles = await server.roles.fetch();
    
    roles.forEach(role => {
      if(role.permissions.equals(0n)) {
        this.roleRegistry.push(role)
      } else {
        this.rolesWithPermissions++
      }
    })
  }
}


//----------------
exports.cosmeticRoleRegistry = new CosmeticRoleRegistry()