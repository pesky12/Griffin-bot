import checkAccess from '../Utils/checkAccess'
import { helpDescEmbed } from '../Utils/embeds'

exports.run = async (client, message, args, config) => {
  let longest = Array.from(client.commands.keys()).reduce((long, str) => Math.max(long, str.length), 0)
  let helpList = []
  let command = client.commands.get(args[0])
  if (command) {
    if (!command.settings.public || command.settings.owneronly) return
    return message.channel.send({ embed: helpDescEmbed(command) })
  }
  let imustpromisecuzjs = client.commands.map(async c => {
    if (args[0] !== 'all') {
      let access = await checkAccess(message, c)
      if (!access) return
    } else {
      if (!c.settings.public || c.settings.owneronly) return
    }
    helpList.push(`{ ${process.env.PREFIX}${c.help.name}${' '.repeat(longest - c.help.name.length)} : '${c.help.description}' }`)
  })
  await Promise.all(imustpromisecuzjs)
  message.channel.send(`Here is the list of commands you can use ❤\nTo see all the commands use ${process.env.PREFIX}help all\n${helpList.join('\n')}`, { code: 'css' })
}

exports.settings = {
  enabled: true,
  public: true,
  pm: true,
  owneronly: false,
  permissionsRequired: []
}

exports.help = {
  name: 'help',
  description: '❔ It will show you this window!!',
  longDescription: '',
  usage: 'help [command]'
}