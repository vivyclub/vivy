import TwitchJs, { Chat } from 'twitch-js';
import TelegramBot from "node-telegram-bot-api";
import fetchUtil from 'twitch-js/lib/utils/fetch'

export interface ChatMessage {
    username: string;
    message: string;
    source: "twitch" | "telegram";
}


// Twitch

const onAuthenticationFailure = () =>
    fetchUtil('https://id.twitch.tv/oauth2/token', {
        method: 'post',
        search: {
            grant_type: 'refresh_token',
            refresh_token: "",
            client_id: "",
            client_secret: "",
        },
    }).then((response) => response.accessToken)

const twitchJs = new TwitchJs({
    // token: 'pxwtsrc5tnxm9gvpdg9czj52k57qq5'
    clientId: "",
    token: '',
    username: "",
    onAuthenticationFailure,
    log: {
        level: "silent"
    }
})

export const processChatMessages = (onNewMessage: (msg: ChatMessage) => any) => {
    try {
        twitchJs.chat.connect().then((channelState) => {
            twitchJs.chat.join("#vivyclub").then((channelState) => {
                console.log("Joined channel");
            });
        })


        twitchJs.chat.on("*", msg => {
            if (msg.command === "PRIVMSG") {
                onNewMessage({
                    username: msg.username,
                    message: msg.message,
                    source: "twitch"
                })
            }
        })
    } catch (err) {
        console.log(err)
    }
}


// Telegram

const token = "";

// @ts-ignore
export const bot = new TelegramBot(token, { polling: true });

export const processTelegramMessages = (onNewMessage: (msg: ChatMessage) => any) => {
    bot.on('message', (msg) => {
        // Check that the message includes /vivy
        const commandsToExclude = ["/vivyadmin"];

        if (msg.text.includes("/vivy") && !msg.text.includes("/vivyadmin")) {
            onNewMessage({
                message: msg.text.replace("/vivy", ""),
                username: msg.from.username,
                source: "telegram"
            })
        }

    });
}

export const processTelegramMessagesAdmin = (onNewMessage: (msg: ChatMessage) => any) => {
    bot.on('message', (msg) => {
        // Check that the message includes /vivy
        if (msg.text.includes("/vivyadmin")) {
            const text = msg.text.replace("/vivyadmin", "");
            onNewMessage({
                message: text,
                username: msg.from.username,
                source: "telegram"
            })
        }

    });
}