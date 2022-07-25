/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable no-await-in-loop */
import { exec, execFile, spawnSync } from 'child_process';
import {
  createReminderInsertSQL,
  createReminderTable,
  createMessageToSendTable,
  findMessagesToMarkReadInChatIDSQL,
  generateMessageSearchQuery,
  generateNewMessageQuery,
  getAllChatSummary,
  getBadgeNumberSQL,
  getChatParticipantSQL,
  getNamesForNumbersSQL,
  getRemindersSQL,
  setMessagesToReadSQL,
  getUnrepliedMessagesSQL,
  createAutoReminderSQL,
  updateReminderSQL,
  updateAutoChatGuidRemindersSQL,
  updateManualReminderByMessageIdSQL,
  getChatGuidsLastMessageMeSQL,
  createMessageToSendSQL,
  getTimedMessagesReadyToSendSQL,
  updateTimedMessageSQL,
  getMessagesToSendFeedSQL,
  cancelMessageToSendSQL,
  updateMessageToSendSQL,
} from './sql';

const fs = require('fs');

const SQLiteMessagesDB = `${process.env.HOME}/Library/Messages/chat.db`;
// eslint-disable-next-line no-useless-escape
const ContactDB = `/Users/andrewburns/Library/Application\ Support/AddressBook/Sources/653D320B-FD72-4A2C-9D37-586E60690EC2/AddressBook-v22.abcddb`;

const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(SQLiteMessagesDB);
// const contactdb = new sqlite3.Database(ContactDB);

// maybe store message context for message? not too sure

// const setChatToRead = (chatGuid: string): string => {
//   return `
//     UPDATE message join chat_message_join
//   `
// };

const getNamesForNumbers = async () => {
  const contactdbPaths = spawnSync('find', [
    `${process.env.HOME}/Library/Application\ Support/AddressBook/Sources/`,
  ])
    .stdout.toString()
    .split('\n')
    .filter(
      (x) =>
        x.includes('AddressBook-v22.abcddb') &&
        x.split('/').slice(-1)[0] === 'AddressBook-v22.abcddb'
    );
  let results = [];
  for (const x in contactdbPaths) {
    const contactdb = new sqlite3.Database(contactdbPaths[x]);
    const result = await new Promise((resolve) => {
      contactdb.serialize(function () {
        contactdb.all(getNamesForNumbersSQL, function (err: any, rows: any) {
          if (!rows || !rows.length) {
            return resolve(false);
          }
          return resolve(rows);
        });
      });
    });
    results = results.concat(result);
  }
  return results;
};

const runSelect = async (sql: string) => {
  const result = await new Promise((resolve) => {
    db.serialize(function () {
      db.all(sql, function (err: any, rows: any) {
        if (!rows || !rows.length) {
          return resolve(false);
        }
        return resolve(rows);
      });
    });
  });
  return result;
};

const getLatestMessageRowId = async () => {
  const result = await runSelect(
    `select ROWID from message order by ROWID desc limit 1`
  );
  return result;
};

const attemptCreateReminderTable = async () => {
  await runSelect(createReminderTable);
  await runSelect(createMessageToSendTable);
  return true;
};

const setMessagesToReadForChat = async (chatGuid: string) => {
  const sql = findMessagesToMarkReadInChatIDSQL(chatGuid);
  const idRows = await runSelect(sql);
  if (!idRows) return;
  await runSelect(setMessagesToReadSQL(idRows.map((row: any) => row.ROWID)));
};

const getChatMessages = async (
  chatGuid: string,
  limit: number,
  lastRowId = 99999999999
) => {
  const result = await runSelect(
    generateMessageSearchQuery(chatGuid, limit, lastRowId)
  );
  return result;
};

const getMessageAfterRowId = async (lastRowIdSeen: number) => {
  const result = await runSelect(generateNewMessageQuery(lastRowIdSeen));
  return result;
};

const getChatParticipants = async () => {
  const result = await runSelect(getChatParticipantSQL);
  return result;
};

const getBadgeNumber = async () => {
  const result = await runSelect(getBadgeNumberSQL);
  return result;
};

const getReminders = async () => {
  const result = await runSelect(getRemindersSQL);
  return result;
};

const getChatPreviews = async () => {
  // return "";
  const result = await new Promise((resolve) => {
    db.serialize(function () {
      db.all(getAllChatSummary, function (err: any, rows: any) {
        if (!rows || !rows.length) {
          return resolve(false);
        }
        return resolve(rows);
      });
    });
  });
  return result;
};

const createAutoReminders = async () => {
  const results = await runSelect(getUnrepliedMessagesSQL);
  if (results) {
    results.forEach((result) => {
      runSelect(createAutoReminderSQL([result]));
    });
  }

  const resultsToClear = await runSelect(getChatGuidsLastMessageMeSQL);
  if (resultsToClear) {
    resultsToClear.forEach((resultsToClear) => {
      runSelect(updateAutoChatGuidRemindersSQL(resultsToClear['chat.guid']));
    });
  }
};

const updateReminder = async (reminder_id: number, newStatus = 'dismissed') => {
  await runSelect(updateReminderSQL(reminder_id, newStatus));
};

const updateAutoChatGuidReminders = async (chatGuid: string) => {
  await runSelect(updateAutoChatGuidRemindersSQL(chatGuid));
};

const updateManualReminderByMessageId = async (messageRowId: number) => {
  await runSelect(updateManualReminderByMessageIdSQL(messageRowId));
};

const createMessageToSend = async (
  chat_guid: string,
  body: string,
  scheduled_for: Date
) => {
  await runSelect(createMessageToSendSQL(chat_guid, body, scheduled_for));
};

const getMessagesToSend = async () => {
  const results = await runSelect(getTimedMessagesReadyToSendSQL);
  return results;
};

const updateMessageToSend = async (message_to_send_id: number) => {
  await runSelect(updateTimedMessageSQL(message_to_send_id));
};

const editMessageToSend = async (
  message_to_send_id: number,
  newText: string
) => {
  console.log(updateMessageToSendSQL(message_to_send_id, newText));
  await runSelect(updateMessageToSendSQL(message_to_send_id, newText));
};

const getMessageToSendFeed = async () => {
  const results = await runSelect(getMessagesToSendFeedSQL);
  return results;
};

const deleteMessageToSend = async (message_to_send_id: number) => {
  await runSelect(cancelMessageToSendSQL(message_to_send_id))
}

const massDeleteReminders = async (type: string) => {
  await runSelect(
    `UPDATE reminder set dismissed_at="${new Date().toISOString()}" where type="${type}"`
  );
};

const createReminder = async (
  message_id: string,
  remind_at: Date,
  chat_id: number,
  note = '',
  type = 'manual'
) => {
  await runSelect(
    createReminderInsertSQL(
      message_id,
      remind_at.toISOString(),
      chat_id,
      note,
      type
    )
  );
};

module.exports = {
  getChatPreviews,
  getNamesForNumbers,
  getChatMessages,
  getMessageAfterRowId,
  getLatestMessageRowId,
  getChatParticipants,
  attemptCreateReminderTable,
  createReminder,
  getBadgeNumber,
  setMessagesToReadForChat,
  getReminders,
  createAutoReminders,
  updateReminder,
  updateAutoChatGuidReminders,
  updateManualReminderByMessageId,
  createMessageToSend,
  getMessagesToSend,
  updateMessageToSend,
  massDeleteReminders,
  editMessageToSend,
  getMessageToSendFeed,
  deleteMessageToSend,
};
