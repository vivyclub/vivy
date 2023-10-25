import openai from 'openai';
import { PollyClient, Polly } from '@aws-sdk/client-polly';
import fs from 'fs';
import sound from 'sound-play';

// create a new client
export const client = new openai({
    apiKey: "OPENAI_API_KEY_HERE"
});


export const chatCompletion = async (system: string, user: string, temperature = 1) => {
    const completion = await client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        temperature: temperature,
        messages: [
            { "role": "system", "content": system },
            { "role": "user", "content": user },
        ]
    })
    const response = completion.choices[0].message.content;
    return response;
}
