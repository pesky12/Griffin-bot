const Discord = require('discord.js')

exports.run = (client, config) => {
  client.on('guildBanAdd', async(guild, user) => {
    if (!guild.channels.exists('name', 'mod-log')) return
    let auditLog = await guild.fetchAuditLogs({ limit: 1, type: 23 })
    let auditLogEntry = auditLog.entries.first()
    console.log(auditLogEntry)
    let embed = new Discord.RichEmbed()
        .setAuthor(`${user.tag}(${user.id}) has been unbanned!`)
        .addField('Moderator', auditLogEntry.executor, true)
        .setColor('#c4350d')
        .setTimestamp(new Date())
    guild.channels.find('name', 'mod-log').send({ embed })
  })
}

exports.help = {
  name: 'User banned',
  description: 'Triggered when somebody is banned'
}

exports.settings = {
  enabled: true,
  public: true
}
