import fs from 'fs';

export let thingsVivySaid: string[] = [];

export const addThingVivySaid = (thing: string) => {
    thingsVivySaid.push(thing);
}

export const saveStorage = () => {
    try {
        fs.writeFileSync('./storage.json', JSON.stringify({
            thingsVivySaid
        }));
    } catch (err) {
        console.log(err);
    }
}

export const loadThingsVivySaid = () => {
    try {
        const storage = JSON.parse(fs.readFileSync('./storage.json', 'utf8'));
        thingsVivySaid = storage.thingsVivySaid;
    } catch (err) {
        console.log(err);
    }
}