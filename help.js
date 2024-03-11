import { TelegramClient, Api } from "telegram";
import { CustomFile } from "telegram/client/uploads.js";
import { StringSession } from "telegram/sessions/index.js";
import { NewMessage } from "telegram/events/index.js";
// const { CustomFile } = require("telegram/client/uploads/");
import { writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

let updates = []; // Глобальный массив для хранения обновлений

export async function handleUpdate(update, client) {
  console.log("updateupdateupdateupdateupdate в handleUpdate");
  console.log("глобальный updatesupdatesupdatesupdatesupdate", updates);
  // Извлекаем groupedId из пришедшего update
  console.log('update.message', update.message.peerId)
  const peer = await client.getPeerId(update.message.peerId);
  console.log('peerpeerpeerpeerpeerpeerpeerpeerpeerpeerpeerpeerpeerpeer', peer)
  const groupedId = await update.message?.groupedId?.value;
  // Проверяем, существует ли уже группа с таким groupedId
  const existingGroupIndex = updates.findIndex(
    (group) => group.groupedId === groupedId,
  );
  console.log(
    "existingGroupIndexexistingGroupIndexexistingGroupIndex",
    existingGroupIndex,
  );

  if (existingGroupIndex !== -1) {
    console.log(
      "Если группа существует, добавляем update в messages этой группы",
    );

    // Если группа существует, добавляем update в messages этой группы
    // updates[existingGroupIndex].messages.push(update);
    const media = update?.message?.media;
    try {
      const buffer = await client.downloadMedia(media, { workers: 1 });
      const fileName = `media_${Date.now()}_${update.message.id}.jpg`;
      await writeFile(fileName, buffer, "binary"); // Убедитесь, что файл сохранен
      updates[existingGroupIndex].messages.push(fileName); // Обновляем после сохранения
      console.log("updatesupdateswxexexexexex", updates);
    } catch (error) {
      console.error("Error downloading or saving media:", error);
    }

    if (update?.message?.message) {
      updates[existingGroupIndex].textMessage = update.message.message;
    }
  } else {
    // Если группы нет, сначала выводим в консоль текущее содержимое updates (если оно не пустое)
    if (updates.length > 0) {
      console.log("Текущие группы обновлений:", updates);
      async function sendPrevious(updates) {
        const result = [];

        // Используем цикл for...of для асинхронной обработки
        for (const image of updates[0].messages) {
          // console.log(`Загружается файл: ${image}`);
          const toUpload = new CustomFile(
            `./${image}`,
            fs.statSync(`./${image}`).size,
            `./${image}`,
          );
          const file = await client.uploadFile({
            file: toUpload,
            workers: 1,
          });
          // console.log(`Файл загружен: ${image}`);
          result.push(file);
        }

        // console.log('Загруженные файлы:', result);
        // console.log('Отправка сообщения с медиафайлами...');

        // Отправляем файлы
        await client.sendFile(-1001832723937, {
          file: result,
          caption: updates[0].textMessage,
        });

        // console.log('Сообщение отправлено.');
      }
      async function delImages(updates) {
        if (updates.length > 0 && updates[0].messages.length > 0) {
          for (const image of updates[0].messages) {
            try {
              await fs.unlinkSync(`./${image}`);
              console.log(`Файл удален: ${image}`);
            } catch (error) {
              console.error(`Ошибка при удалении файла ${image}:`, error);
            }
          }
        }
      }
      await sendPrevious(updates);
      await delImages(updates);
      console.log("Текущие группы обновлений:", updates);
      updates = []; // Очищаем массив, если требуется
    }
    // Создаем новую группу с данным groupedId и добавляем в нее update

    const newGroup = {
      textMessage: update?.message?.message,
      groupedId: groupedId,
      // messages: [update]
      messages: [],
    };

    const media = update?.message?.media;
    try {
      const buffer = await client.downloadMedia(media, {
        workers: 1,
      });

      // Задаем имя файла с расширением .jpg (или .png, в зависимости от формата изображения)
      const fileName = `media_${Date.now()}_${update.message.id}.jpg`; // Например, media_1648667530931.jpg
      newGroup.messages.push(fileName);
      console.log("newGroupnewGroupnewGroupnewGroupnewGroup", newGroup);
      updates.push(newGroup);
      console.log("updatesafterpushupdatesafterpushupdatesafterpush", updates);
      // Сохраняем файл в бинарном формате
      await writeFile(fileName, buffer, "binary");
      // console.log("Media saved as", fileName);
    } catch (error) {
      console.error("Error downloading or saving media:", error);
    }
  }
}
