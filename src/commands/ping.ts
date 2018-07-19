import { Message } from 'discord.js'

exports.run = (message: Message) => {
  message.channel.send('Ping?!').then((msg: any) => {
    msg.edit(`<:gun:333359555117580291> BANG! Ur dead! (Took me: ${msg.createdTimestamp - message.createdTimestamp}ms)`)
  })
}

exports.settings = {
  enabled: true,
  pm: true,
  name: 'ping',
  shortDesc: '',
  longDesc: '',
  usage: '',
  perms: ['SEND_MESSAGES']
}
