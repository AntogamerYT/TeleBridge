import { Client, TextChannel } from "discord.js";
import { Context, Telegraf, } from "telegraf";
import { escapeChars, handleUser } from "../../../setup/main.js";
import { channelPost } from "telegraf/filters";


export const name = "text";
export async function execute(tgclient: Telegraf, dsclient: Client, ctx: Context) {
    if (!ctx.has(channelPost("text"))) return;
    try {
        for (let i = 0; i < global.config.bridges.length; i++) {
            if (global.config.bridges[i].disabled) continue;
            const discordChatId = global.config.bridges[i].discord.chat_id;
            const telegramChatId = global.config.bridges[i].telegram.chat_id;
            if (parseInt(telegramChatId) === ctx.chat.id) {
                if (ctx.channelPost.text === "/delete") {
                    const message = ctx.channelPost.message_id
                    if (!message) return ctx.reply('Please reply to a message to delete it.')
                    const messageid = await global.db.collection("messages").findOne({ telegram: message })
                    if (messageid != undefined) {
                        tgclient.telegram.deleteMessage(telegramChatId, message)
                        const msg = await (dsclient.channels.cache.get(discordChatId) as TextChannel).messages.fetch(messageid.discord)
                        msg.delete()
                        await global.db.collection('messages').deleteOne({ telegram: message })
                    } else {
                        ctx.reply('Message not found')
                    }
                    ctx.deleteMessage()
                    return;
                }
                if (ctx.update.channel_post.reply_to_message) {
                    const msgid = await global.db.collection("messages").findOne({ telegram: ctx.update.channel_post.reply_to_message.message_id })
                    if (msgid) {
                        const msg = await (dsclient.channels.cache.get(discordChatId) as TextChannel).messages.fetch(msgid.discord)
                        const newmsg = await msg.reply(`**${escapeChars(ctx.update.channel_post.chat.title)}**:\n ${ctx.update.channel_post.text}`)
                        await global.db.collection('messages').insertOne({ telegram: ctx.update.channel_post.reply_to_message.message_id, discord: newmsg.id })
                        return;
                    }
                }
                const msg = await (dsclient.channels.cache.get(discordChatId) as TextChannel).send(`**${escapeChars(ctx.update.channel_post.chat.title)}**:\n ${ctx.update.channel_post.text}`);
                await global.db.collection("messages").insertOne({ telegram: ctx.channelPost.message_id, discord: msg.id })
            }
        }
    } catch (error) {
        console.log(error)
    }
}