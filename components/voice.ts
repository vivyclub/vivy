import { PollyClient, Polly } from '@aws-sdk/client-polly';
import fs from 'fs';
// import Client from 'fakeyou.ts'
import { v4 } from 'uuid';
import axios from 'axios';
import { promisify } from 'util';
import { pipeline } from 'stream';

// const pollyConfig = new PollyClient({
//     region: "",
//     credentials: {
//         accessKeyId: "",
//         secretAccessKey: "",
//     }
// })
// const polly = new Polly(pollyConfig);

// export const generateVoice = async (text: string) => {
//     try {
//         const resp = await polly.synthesizeSpeech({
//             Text: text,
//             OutputFormat: "mp3",
//             VoiceId: "Ivy",
//         })
//         // save audiostream to a file
//         if (resp.AudioStream) {
//             // const blob = new Blob(resp.AudioStream as any, { type: resp.ContentType });
//             const byteArray = await resp.AudioStream.transformToByteArray();
//             const buffer = Buffer.from(byteArray);

//             // create a new file based on timestamp in sounds folder
//             const filename = process.cwd() + `\\sounds\\${Date.now()}.mp3`;
//             fs.writeFileSync(filename, buffer);
//             return filename;
//         }
//     } catch (err) {
//         console.error(err)
//     }
// }

// const fakeYouClient = new Client();
// fakeYouClient.login({
//     username: "textbyjohnny@gmail.com",
//     password: "Johnnyboy1"
// })

const cookie = ""

export const generateVoiceFakeYou = async (text: string) => {
    const headers = new Headers();

    headers.append("content-type", "application/json");
    headers.append("credentials", "include"); // IMPORTANT! Your cookie will not be sent without this!
    headers.append("cookie", `session=${cookie}`); // Add the cookie

    const uuid = v4();

    const response = await fetch("https://api.fakeyou.com/tts/inference", {
        headers,
        method: "POST",
        body: JSON.stringify({
            tts_model_token: "TM:vfq22020ena5",
            "uuid_idempotency_token": uuid,
            inference_text: text
        })
    })
    const json = await response.json();
    // console.log(json);

    if (!json.success) {
        console.error("Could not generate voice")
        console.error(json)
        return;
    }

    const inference_job_token = json.inference_job_token;

    const filename = process.cwd() + `\\sounds\\${Date.now()}.mp3`;
    // poll for inference job
    const poll = async () => {
        const response = await fetch(`https://api.fakeyou.com/tts/job/${inference_job_token}`, {
            headers,
            method: "GET"
        })
        const json = await response.json();
        // console.log(json);

        if (json.state.status === "complete_success") {

            // download the file
            const fileUrl = "https://storage.googleapis.com/vocodes-public" + json.state.maybe_public_bucket_wav_audio_path;

            // download the file and save it to the sounds folder
            await downloadAndSaveMp3(fileUrl, filename);
            return filename;
        } else {
            // poll again
            // delay for 0.5 seconds
            await new Promise((resolve) => setTimeout(resolve, 500));
            return await poll();
        }
    }

    await poll();
    return filename;
}

const streamPipeline = promisify(pipeline);

async function downloadAndSaveMp3(url, savePath) {
    const { data } = await axios.get(url, {
        responseType: 'stream'
    });

    await streamPipeline(data, fs.createWriteStream(savePath));
}