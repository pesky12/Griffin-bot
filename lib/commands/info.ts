import { Message, Client, RichEmbed } from 'discord.js'

exports.run = async (client: Client, message: Message) => {
  let invitelink = await client.generateInvite(8)
  let embed = new RichEmbed()
    .setTitle(`Infoboard for ${client.user.username}`)
    .setDescription('Here is some info about this bot!!')
    .addField('Uptime', `${client.uptime} Miliseconds`, true)
    .addField('Code Creator', client.users.get('235047463017381888').tag, true)
    .addField('Repo', 'https://bitbucket.org/Peskyn12/griffin-bot')
    .addField('Invite me!!', invitelink)
    .addField('Support', 'You can support on these platforms:')
    .addField('Dogecoin', 'D5M6JbBDUkBbRfppNZZeGuyWzAAqgjghPg')
    .setColor('#7f16ff')
    .setThumbnail(client.users.get('235047463017381888').avatarURL)
  message.channel.send({ embed })
  console.log(embed)
}

exports.settings = {
  enabled: true,
  public: true,
  PM: true,
  owneronly: false,
  permissionsRequired: []
}

exports.help = {
  name: 'info',
  description: '🔧 Shows info about the bot.',
  longDescription: '',
  usage: 'info'
}
