import Discord from 'discord.js';
import {default as tgclient} from './telegram.js'
import 'dotenv/config'
import md2html from './setup/md2html.js';

const dsclient = new Discord.Client({intents: 33281, allowedMentions: { repliedUser: false }});

dsclient.on('ready', () => {
    dsclient.channels.cache.get(process.env.discordchannelid).send('Discord Client ready and logged in as ' + dsclient.user.tag + '.');
})

dsclient.on('messageCreate', (message) => {
    if (message.author.bot) return;
    if(message.channel.id != process.env.discordchannelid) return;
    let attachmentarray = [];
    message.attachments.forEach(async ({ url }) => {
        attachmentarray.push(url);
    });
    let msgcontent;
    if(message.cleanContent) msgcontent = md2html(message.cleanContent);
    if(!msgcontent) msgcontent = '';
    const string = attachmentarray.toString().replaceAll(',', ' ')
    tgclient.telegram.sendMessage(process.env.tgchatid, `<b>${message.author.tag}</b>:\n${msgcontent} ${string}`, {parse_mode: 'html'})
    ;})
export default dsclient;
