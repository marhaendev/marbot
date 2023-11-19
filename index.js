const { default: makeWASocket, MessageType, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');

const processedMessages = new Set();

async function bot() {
  const auth = await useMultiFileAuthState('session');
  const socket = makeWASocket({
    printQRInTerminal: true,
    browser: ['Tutorial Bot', 'Chrome', '1.0.0'],
    auth: auth.state,
    logger: pino({ level: 'silent' })
  });

  socket.ev.on('creds.update', auth.saveCreds);
  socket.ev.on('connection.update', ({ connection }) => {
    if (connection === 'open') console.log('Bot Activated ...');
    if (connection === 'close') bot();
  });

  socket.ev.on('messages.upsert', async ({ messages }) => {
    const receivedMessage = messages[0];

    if (!receivedMessage.message || !receivedMessage.message.conversation) {
      // Handle the case where message or conversation is null
      return;
    }

    if (processedMessages.has(receivedMessage.key.id)) return;
    processedMessages.add(receivedMessage.key.id);

    const cmd = receivedMessage.message.conversation.toLowerCase();

    // function reply(text) {
    //   socket.sendMessage(receivedMessage.key.remoteJid, { text }, { quoted: receivedMessage });
    // }
    
//     function reply(text) {
//   const escapedText = encodeURIComponent(text);
//   socket.sendMessage(receivedMessage.key.remoteJid, { text: escapedText }, { quoted: receivedMessage });
// }

function reply(text) {
  const fullText = `${text}`;
  socket.sendMessage(receivedMessage.key.remoteJid, { text: fullText }, { quoted: receivedMessage });
}


  // Read responses from JSON file
  const responses = JSON.parse(fs.readFileSync('./responses.json', 'utf-8'));
  
  // Check response types
  if (responses.hasOwnProperty("full") && responses["full"].hasOwnProperty(cmd)) {
    reply(responses["full"][cmd]);
    return;
  }
  
  if (responses.hasOwnProperty("contains")) {
    for (const key in responses["contains"]) {
      if (receivedMessage.message.conversation.toLowerCase().includes(key)) {
        const randomIndex = Math.floor(Math.random() * responses["contains"][key].length);
        reply(responses["contains"][key][randomIndex]);
        return;
      }
    }
  }

  if (responses.hasOwnProperty("starts_with")) {
    for (const key in responses["starts_with"]) {
      if (receivedMessage.message.conversation.toLowerCase().startsWith(key)) {
        reply(responses["starts_with"][key]);
        return;
      }
    }
  }

  if (responses.hasOwnProperty("ends_with")) {
    for (const key in responses["ends_with"]) {
      if (receivedMessage.message.conversation.toLowerCase().endsWith(key)) {
        reply(responses["ends_with"][key]);
        return;
      }
    }
  }

  
    // if (cmd.startsWith('gt')) {
    //   const newSubject = receivedMessage.message.conversation.slice('gt'.length).trim();
    //   await socket.groupUpdateSubject(receivedMessage.key.remoteJid, newSubject);
    //   return;
    // }
    
    if (cmd.startsWith('gt')) {
      const newSubject = receivedMessage.message.conversation.slice('gt'.length).trim();
      await socket.groupUpdateSubject(receivedMessage.key.remoteJid, newSubject);
      return;
    }
    
    if (cmd.startsWith('gd')) {
      const newDescription = receivedMessage.message.conversation.slice('gd'.length).trim();
      await socket.groupUpdateDescription(receivedMessage.key.remoteJid, newDescription);
      return;
    }

    if (cmd.startsWith('link')) {
      const groupLink = await socket.groupInviteCode(receivedMessage.key.remoteJid);
      reply('https://chat.whatsapp.com/${groupLink}');
      return;
    }
    
    if (cmd.startsWith('id')) {
      const id = "6285789804636@s.whatsapp.net";
      // send a buttons message!
const buttons = [
  { buttonId: "id1", buttonText: { displayText: "Button 1" }, type: 1 },
  { buttonId: "id2", buttonText: { displayText: "Button 2" }, type: 1 },
  { buttonId: "id3", buttonText: { displayText: "Button 3" }, type: 1 },
];

const buttonMessage = {
  text: "Hi it's button message",
  footer: "Hello World",
  buttons: buttons,
  headerType: 1,
};

const sendMsg = await socket.sendMessage(id, buttonMessage);

      return;
    }
    
    
  });

  // ... jika tidak menerima apapun
}

bot();