import { TelegramClient, Api } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import input from "input"; // npm i input
import { handleUpdate } from "./help.js";
import dotenv from "dotenv";

dotenv.config();

const apiId = +process.env.API_ID;
const apiHash = process.env.API_HASH;
const stringSession = new StringSession(process.env.STRING_SESSION); // fill this later with the value from session.save()
// const stringSession = new StringSession(); // fill this later with the value from session.save()


(async () => {
  console.log("Loading interactive example...");

  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => await input.text("number ?"),
    password: async () => await input.text("password?"),
    phoneCode: async () => await input.text("Code ?"),
    onError: (err) => console.log(err),
  });

  console.log("You should now be connected.");

  console.log(client.session.save()); // Save this string to avoid logging in again // строка с сессией

  // await client.sendMessage("me", { message: "Hello!" }); // Пример отправки себе сообщения
  const updateQueueTimeout = 800; // Задаем время ожидания в миллисекундах (здесь 1 секунда)
  const updateQueue = [];
  let isProcessing = false;
  let updateQueueTimer = null;

  async function processQueue() {
    if (isProcessing) return;
    isProcessing = true;
  
    while (updateQueue.length > 0) {
      const currentUpdate = updateQueue.shift();
      await handleUpdate(currentUpdate, client);
    }
  
    isProcessing = false;
    updateQueueTimer = null; // Сбрасываем таймер
  }


  client.addEventHandler(async (update) => {
    console.log('💁👌🎍😍updateupdate💁👌🎍😍💁👌🎍', update?.message?.peerId?.channelId?.value)
      if (update.className === "UpdateNewChannelMessage" && update?.message?.peerId?.channelId?.value === 1913531068n && update?.message?.media !== null) {
        updateQueue.push(update);
      if (!isProcessing && !updateQueueTimer) { // Проверяем, что нет активного процесса и таймера
        // Вызываем processQueue с задержкой, если нет активного процесса и таймера
        updateQueueTimer = setTimeout(processQueue, updateQueueTimeout);
      }
    }
  });
})();
