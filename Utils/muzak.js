const YoutubeDL = require('youtube-dl');
const ytdl = require('ytdl-core');
const Discord = require('discord.js');
const config = require('../config.json');
const prefix = config.prefix;

module.exports = (client) =>{
  let queues = {};

  client.on('message', msg => {
    const message = msg.content.trim();


    if (message.toLowerCase().startsWith(prefix.toLowerCase())) {
      const command = message.substring(prefix.length).split(/[ \n]/)[0].toLowerCase().trim();
      const args = message.substring(prefix.length + command.length).trim();

      switch (command) {
        case 'play':
          return play(msg, args);
        case 'skip':
          return skip(msg, args);
        case 'queue':
          return queue(msg, args);
        case 'pause':
          return pause(msg, args);
        case 'resume':
          return resume(msg, args);
        case 'leave':
          return leave(msg, args);
      }
    }
  });

  function isAdmin(member)
  {
    return member.hasPermission('MANAGE_MESSAGES');
  }

  function getQueue(server)
  {
    if (!queues[server]) queues[server] = [];
    return queues[server];
  }

  function play(msg, args) {
    if (msg.member.voiceChannel === undefined) return msg.channel.send('You\'re not in a voice channel.');

    if (!args) return msg.channel.send('I need the name of the song!!');

    const queue = getQueue(msg.guild.id);

    let Searching = new Discord.RichEmbed()
      .setAuthor(`Searching for '${args}'!!`, 'http://pic.2265.com/upload/2017-5/2017519152314485.png')
      .setDescription('Please wait while im searching my nest for that song!!')
      .setFooter(`Requested by: ${msg.author.tag}`)
      .setColor('#f26b04');

    msg.channel.send({embed: Searching}).then(botmsg => {
      var videoname = args;

      if (!args.toLowerCase().startsWith('http')) {
        videoname = 'gvsearch1:' + args;
      }

      YoutubeDL.getInfo(videoname, ['-q', '--no-warnings'], (err, info) => {
        let Searching = new Discord.RichEmbed()
          .setAuthor(`I can't find ${args}!!`,'https://cdn0.iconfinder.com/data/icons/shift-free/32/Error-128.png')
          .setDescription('Try to use direct link.')
          .setFooter(`Requested by: ${msg.author.tag}`)
          .setColor('#c40101');
        if (err || info.format_id === undefined || info.format_id.startsWith('0')) {
          botmsg.delete();
          msg.channel.send({embed: Searching});
          client.channels.get('333727164937666562').send(`${new Date()} MusicBot: ${err}`);
          return;
        }
        console.log(videoname);
        info.requester = msg.author.id;

        let SearchingRes = new Discord.RichEmbed()
          .setAuthor(`${info.fulltitle}`, 'http://pic.2265.com/upload/2017-5/2017519152314485.png')
          .addField('Uploaded by:', `${info.uploader}`,true)
          .addField('Duration:', `${info.duration}`,true)
          .setFooter(`Requested by: ${msg.author.tag}`)
          .setThumbnail(info.thumbnail)
          .setColor('#f26b04');
        botmsg.delete();

        msg.channel.send({embed: SearchingRes}).then(() => {
          queue.push(info);
          if (queue.length === 1) executeQueue(msg, queue);
        }).catch(console.log);
      });
    }).catch(console.log);
  }


  function skip(msg) {

    const voiceConnection = client.voiceConnections.find(val => val.channel.guild.id == msg.guild.id);
    if (voiceConnection === null) {
      let NoSkip = new Discord.RichEmbed()
        .setAuthor('Im not playing anything!!', 'https://cdn0.iconfinder.com/data/icons/shift-free/32/Error-128.png')
        .setColor('#f26b04');
      msg.channel.send({embed: NoSkip}).then((botmsg) =>{
        botmsg.delete(5000);
      });
      return;
    }


    const queue = getQueue(msg.guild.id);
    //
    // if (!canSkip(msg.member, queue)) return msg.channel.send(wrap('You cannot skip this as you didn\'t queue it.')).then((response) => {
    // 	response.delete(5000);
    // });

    let toSkip = 1;

    queue.splice(0, toSkip - 1);

    const dispatcher = voiceConnection.player.dispatcher;
    if (voiceConnection.paused) dispatcher.resume();
    dispatcher.end();
    let skip = new Discord.RichEmbed()
      .setAuthor('Skipped!!', 'https://www.iconexperience.com/_img/g_collection_png/standard/512x512/ok.png')
      .setColor('#f26b04')
      .setFooter(`Skipped by ${msg.author.tag}`);
    msg.channel.send({embed: skip});
  }

  function queue(msg) {
    const queue = getQueue(msg.guild.id);
    const text = queue.map((video, index) => (
      (index + 1) + ': ' + video.title
    )).join('\n');

    let queueStatus = 'Stopped';
    const voiceConnection = client.voiceConnections.find(val => val.channel.guild.id == msg.guild.id);
    if (voiceConnection !== null) {
      const dispatcher = voiceConnection.player.dispatcher;
      queueStatus = dispatcher.paused ? 'Paused' : 'Playing';
    }
    let Queue = new Discord.RichEmbed()
      .setAuthor(`Queue ('${queueStatus}')`, 'https://cdn0.iconfinder.com/data/icons/social-messaging-ui-color-shapes/128/list-circle-blue-128.png')
      .setColor('#0a9cd1')
      .setDescription(`${text}`);

    msg.channel.send({embed: Queue});
  }

  function pause(msg) {
    // Get the voice connection.
    const voiceConnection = client.voiceConnections.find(val => val.channel.guild.id == msg.guild.id);
    if (voiceConnection === null) {
      let NoSkip = new Discord.RichEmbed()
        .setAuthor('Im not playing anything!!', 'https://cdn0.iconfinder.com/data/icons/shift-free/32/Error-128.png')
        .setColor('#f26b04');
      msg.channel.send({embed: NoSkip}).then((botmsg) =>{
        botmsg.delete(5000);
      });
      return;
    }

    if (!isAdmin(msg.member))
      return msg.channel.send('You are not authorized to use this.');

    let pause = new Discord.RichEmbed()
      .setAuthor('Paused', 'https://freeiconshop.com/wp-content/uploads/edd/pause-flat.png')
      .setColor('#0a9cd1')
      .setFooter('Paused by ${message.author.tag}');
    msg.channel.send({embed: pause});
    const dispatcher = voiceConnection.player.dispatcher;
    if (!dispatcher.paused) dispatcher.pause();
  }

  function leave(msg) {
    if (isAdmin(msg.member)) {
      const voiceConnection = client.voiceConnections.find(val => val.channel.guild.id == msg.guild.id);
      if (voiceConnection === null) {
        let NoSkip = new Discord.RichEmbed()
          .setAuthor('Im not playing anything!!', 'https://cdn0.iconfinder.com/data/icons/shift-free/32/Error-128.png')
          .setColor('#f26b04');
        msg.channel.send({embed: NoSkip}).then((botmsg) =>{
          botmsg.delete(5000);
        });
        return;
      }

      const queue = getQueue(msg.guild.id);
      queue.splice(0, queue.length);
      voiceConnection.player.dispatcher.end();
      voiceConnection.disconnect();
    } else {
      msg.channel.send('You don\'t have permission to use that command ya twat!');
    }
  }

  function resume(msg) {

    const voiceConnection = client.voiceConnections.find(val => val.channel.guild.id == msg.guild.id);
    if (voiceConnection === null) {
      let NoSkip = new Discord.RichEmbed()
        .setAuthor('Im not playing anything!!', 'https://cdn0.iconfinder.com/data/icons/shift-free/32/Error-128.png')
        .setColor('#f26b04');
      msg.channel.send({embed: NoSkip}).then((botmsg) =>{
        botmsg.delete(5000);
      });
      return;
    }

    if (!isAdmin(msg.member))
      return msg.channel.send('You don\'t have permission to use that command ya twat!');

    let pause = new Discord.RichEmbed()
      .setAuthor('Resumed', 'http://www.emclient.com/homepage-new/assets/img/icons/play_button.png')
      .setColor('#0a9cd1')
      .setFooter('Resumed by ${message.author.tag}');
    msg.channel.send({embed: pause});
    const dispatcher = voiceConnection.player.dispatcher;
    if (dispatcher.paused) dispatcher.resume();
  }

  function executeQueue(msg, queue) {
    if (queue.length === 0) {
      msg.channel.send('Playback finished.');

      const voiceConnection = client.voiceConnections.find(val => val.channel.guild.id == msg.guild.id);
      if (voiceConnection !== null) return voiceConnection.disconnect();
    }

    new Promise((resolve, reject) => {
      const voiceConnection = client.voiceConnections.find(val => val.channel.guild.id == msg.guild.id);
      if (voiceConnection === null) {
        if (msg.member.voiceChannel) {
          msg.member.voiceChannel.join().then(connection => {
            resolve(connection);
          }).catch((error) => {
            console.log(error);
          });
        } else {
          queue.splice(0, queue.length);
          reject();
        }
      } else {
        resolve(voiceConnection);
      }
    }).then(connection => {
      const video = queue[0];


      let SearchingRes = new Discord.RichEmbed()
        .setAuthor(`Now playing: ${video.fulltitle}`, 'http://pic.2265.com/upload/2017-5/2017519152314485.png')
        .addField('Uploaded by:', `${video.uploader}`,true)
        .addField('Duration:', `${video.duration}`,true)
        .setThumbnail(video.thumbnail)
        .setColor('#f26b04');
      msg.channel.send({embed: SearchingRes}).then(() => {
        let dispatcher = connection.playStream(ytdl(video.webpage_url, {filter: 'audioonly'}), {seek: 0, volume: (50/100)});

        connection.on('error', (error) => {
          // Skip to the next song.
          console.log(error);
          queue.shift();
          executeQueue(msg, queue);
        });

        dispatcher.on('error', (error) => {
          // Skip to the next song.
          console.log(error);
          queue.shift();
          executeQueue(msg, queue);
        });

        dispatcher.on('end', () => {
          // Wait a second.
          setTimeout(() => {
            if (queue.length > 0) {
              // Remove the song from the queue.
              queue.shift();
              // Play the next song in the queue.
              executeQueue(msg, queue);
            }
          }, 1000);
        });
      }).catch((error) => {
        console.log(error);
      });
    }).catch((error) => {
      console.log(error);
    });
  }
};