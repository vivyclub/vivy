# Vivy: Your AI VTuber

![Vivy chilling](https://vivy.club/desk.jpg)

Welcome to Vivy! Dive into a world where you can interact, chat, and meet your very own AI VTuber. Vivy is not just any digital companion; she's an AI Waifu with depth, emotion, and spontaneity, all thanks to the power of GPT-4. Inspired by the songstress AI from "Vivy: Fluorite Eye's Song", this project combines state-of-the-art text-to-speech synthesis with Vtuber animations to bring Vivy to life.

## Table of Contents
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Customization](#customization)
- [License](#license)
- [Acknowledgements](#acknowledgements)

## Getting Started

1. **Clone the Repository**
   ```bash
   git clone https://github.com/vivyclub/vivy.git
   cd vivy
   ```

2. **Install Dependencies**
   Make sure you have Node.js and npm installed. If not, you can download and install them from [here](https://nodejs.org/).
   ```bash
   npm install
   ```

3. **Fill in the Credentials**
   Open the respective files and fill in the necessary credentials:
   - `ai.ts`
   - `chat.ts`
   - `voice.ts`

4. **Run the Application**
   ```bash
   npm start
   ```

5. Interact with Vivy and enjoy the experience!

## Configuration

### API Credentials
Ensure that you provide all the necessary API credentials in the aforementioned files. For most APIs, you would typically need an API Key or Token, which can be obtained by registering on the respective platforms.

## Customization

### Stream Sources
If you wish to use Vivy with your own Twitch stream, simply customize the channel name. For example, to join the "mychannel" Twitch stream, modify the join chat function in the relevant file:

```javascript
twitchJs.chat.join("#mychannel");
```

Replace "mychannel" with the name of your Twitch stream channel.

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.

## Acknowledgements
- Special thanks to OpenAI for the GPT-4 model.
- Inspired by "Vivy: Fluorite Eye's Song".
- FakeYou's voice tacotron API
- Community contributors and supporters.

---

Join the community and help shape the future of Vivy, your AI VTuber.
