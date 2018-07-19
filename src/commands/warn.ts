import { modActionEmbed } from '../Utils/embeds'
import { Message } from 'discord.js'

exports.run = (message: Message, args: Array<string>) => {
  let warnedUsers = message.mentions.users
  let reason = args.slice(warnedUsers.array().length).join(' ') || 'There is none! ¯\\_(ツ)_/¯'
  let messageArray: Array<string> = []
  warnedUsers.map(u => {
    let warnEmbed = modActionEmbed('Warn', message.author, u, reason)
    if (message.guild.channels.exists('name', 'mod-log')) {
      let channel: any = message.guild.channels.find('name', 'mod-log')
      channel.send({ embed: warnEmbed })
    }
    u.send({ embed: warnEmbed })
    messageArray.push(u.username)
  })
  message.channel.send(messageArray)
}

exports.settings = {
  enabled: true,
  pm: false,
  name: 'warn',
  shortDesc: '',
  longDesc: '',
  usage: '',
  perms: ['SEND_MESSAGES', 'MANAGE_MESSAGES']
}
