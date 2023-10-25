import { chatCompletion } from "./components/ai";
import { ChatMessage, processChatMessages, processTelegramMessages, processTelegramMessagesAdmin } from "./components/chat";
import { system_prompt } from "./components/prompt";
import { playSound } from "./components/sound";
import { lifestyle_system_prompt } from "./components/prompt";
import fs from 'fs';
import { client } from "./components/ai";
import { generateVoice } from "./components/voice";
import { generateVoiceFakeYou } from "./components/voice";
import { addThingVivySaid } from "./components/storage";
import { wait } from "./components/utils";

let chatMessages: ChatMessage[] = [];

interface SoundQueue {
    filename: string;
    createdAt: Date;
    type: "chat" | "lifestyle";
}
let soundsToQueue: SoundQueue[] = [];
let isPlayingSound = false;

let qaAnsweredInARow = 0;
const processPendingSounds = async () => {

    if (isPlayingSound) {
        return;
    }
    if (soundsToQueue.length === 0) return;

    if (qaAnsweredInARow >= 3) {
        // look for a lifestyle topic and move it to the front of the queue
        const lifestyleSound = soundsToQueue.find(sound => sound.type === "lifestyle");
        if (lifestyleSound) {
            const index = soundsToQueue.indexOf(lifestyleSound);
            if (index > -1) {
                soundsToQueue.splice(index, 1);
                soundsToQueue.unshift(lifestyleSound);
            }
        }
        qaAnsweredInARow = 0;
    }

    try {
        console.log("========Sound Queue=======");
        const soundsStr = soundsToQueue.map(q => `${q.type}: ${q.filename}`).join("\n");
        console.log(soundsStr);
        console.log("==========================");
        const sound = soundsToQueue.shift();
        const filename = sound?.filename;
        if (!filename) return;

        qaAnsweredInARow++;

        console.log("Playing sound: ", filename);

        isPlayingSound = true;
        await playSound(filename);
        isPlayingSound = false;

        // delete file
        // delete after 20 seconds
        setTimeout(() => {
            fs.unlink(filename, (err) => {
                if (err) {
                    console.error(err);
                    return;
                }
                console.log("Deleted sound file: ", filename);
            });
        }, 20000);

    } catch (err) {
        console.error(err);
    }
}

const processMessages = async () => {
    try {
        // do not process new messages if the audio queue is too long
        if (soundsToQueue.length > 2) return;
        if (chatMessages.length === 0) return;

        const messagesStr = chatMessages.map(msg => `${msg.username} from ${msg.source} said: ${msg.message}`).join("\n");
        console.log("============ Processing new messages =======")
        console.log(messagesStr);
        console.log("============================================")
        chatMessages = [];

        const completion = await chatCompletion(system_prompt, `
The users in the chat said this:
${messagesStr}

Pick and choose one or two questions to answer or discuss with the audience.`);

        if (!completion) {
            console.error("No response from ChatGPT");
            return;
        }

        console.log("Vivy will say: ", completion);
        addThingVivySaid(completion);

        const filename = await generateVoiceFakeYou(completion);
        if (!filename) {
            console.error("No filename from Polly");
            return;
        }

        // Prioritize chat messages
        soundsToQueue.unshift({
            filename,
            createdAt: new Date(),
            type: "chat"
        });

    } catch (err) {
        console.error(err);
    }
}

/* Generates a random topic to talk about */
const processLifestyle = async () => {
    if (soundsToQueue.length > 2) return;
    console.log("============ Processing new lifestyle topic =======")

    // find generate a random topic
    const topicSelect = await client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        temperature: 1,
        messages: [
            { "role": "system", "content": `It's 2023 and you are a vtuber streaming on twitch. Output as a javascript JSON array 10 topics to talk about starting with [` },
        ]
    })

    try {
        const topics = JSON.parse(topicSelect.choices[0].message.content || "[]");
        // select a random topic
        const topic = topics[Math.floor(Math.random() * topics.length)];

        const completion = await chatCompletion(`${lifestyle_system_prompt}

Talk about: ${topic}
        `, ``);

        if (!completion) {
            console.error("No response from ChatGPT");
            return;
        }

        console.log("Vivy will say: ", completion);
        addThingVivySaid(completion);

        console.log("Generating voice...")
        const filename = await generateVoiceFakeYou(completion);
        if (!filename) {
            console.error("No filename from Polly");
            return;
        }
        soundsToQueue.push({
            filename,
            createdAt: new Date(),
            type: "lifestyle"
        });

    } catch (err) {
        console.error(err);
        return;
    }
}

const onNewAdminMessage = async (msg: ChatMessage) => {
    try {
        console.log("=== Manual override ===")
        console.log(msg.message)
        const filename = await generateVoiceFakeYou(msg.message);

        if (msg.message === "skip") {
            isPlayingSound = false;
        }

        if (!filename) {
            console.error("No filename from Polly");
            return;
        }
        soundsToQueue.unshift({
            filename,
            createdAt: new Date(),
            type: "lifestyle"
        });
    } catch (err) {
        console.error(err);
    }
}

const checkForSoundsAndPlay = async () => {
    setInterval(() => {
        processPendingSounds();
    }, 250)
};

const onNewMessage = (msg: ChatMessage) => {
    chatMessages.push(msg);
}

// Store num of concurrent tasks running
let numLifestyleTasks = 0;
let numOfChatTasks = 0;

const processLoop = async () => {

    while (true) {

        console.log(numLifestyleTasks, numOfChatTasks, soundsToQueue.length)
        const totalNumTasks = numLifestyleTasks + numOfChatTasks;
        if (soundsToQueue.length > 3 || totalNumTasks > 4) {
            await wait(1000);
            continue;
        }

        // if there are too many processes running, wait
        if (numLifestyleTasks < 2) {
            numLifestyleTasks++;
            processLifestyle().then(() => {
                numLifestyleTasks--;
            });
            // wait for 10 seconds
            await wait(10000);
        }

        // choose a number between 1 and 3 of questions to answer from the audience
        const randomNumQuestionsToAnswer = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < randomNumQuestionsToAnswer; i++) {
            if (chatMessages.length > 0) {
                // if there are too many processes running, wait
                if (numOfChatTasks <= 2) {
                    numOfChatTasks++;
                    processMessages().then(() => {
                        numOfChatTasks--;
                    });
                    await wait(10000);
                }
            }
        }

        await wait(2000);
    }
}

// Run
processChatMessages(onNewMessage);
processTelegramMessages(onNewMessage);
processTelegramMessagesAdmin(onNewAdminMessage)
processLoop();
checkForSoundsAndPlay();
