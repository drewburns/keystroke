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
  addLastMessageToSendLastMessageRowID,
  createBroadcastListTable,
  createBroadcastListHandleTable,
  createBroadcastListSQL,
  getHandleRowIDsForChatGuidsSQL,
  createBroadcastParticipantSQL,
  getBroadcastListsSQL,
  addMuteToChat,
  toggleChatMuteSQL,
  getLastMessageROWIDForChatSQL,
  deleteTimedMessageSQL,
  getChatGuidsForBroadcastListSQL,
} from './sql';

const Store = require('electron-store');

const store = new Store();

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
  await runSelect(addLastMessageToSendLastMessageRowID);
  await runSelect(createBroadcastListTable);
  await runSelect(createBroadcastListHandleTable);
  await runSelect(addMuteToChat);
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

const getReminders = async (page = 0) => {
  const result = await runSelect(getRemindersSQL(page));
  return result;
};

const getBroadcastLists = async () => {
  const result = await runSelect(getBroadcastListsSQL);
  return result;
};

const toggleChatMute = async (guid: string, val: boolean) => {
  await runSelect(toggleChatMuteSQL(guid, val));
};

const getIsMuted = async (guid: string) => {
  const results = await runSelect(
    `SELECT ks_muted from chat where guid="${guid}"`
  );
  const data = results[0];
  return data.ks_muted;
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
  const results = await runSelect(
    getUnrepliedMessagesSQL(store.get('auto-reminder-default-hours'))
  );
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

const getLastMessageROWIDForChat = async (
  chat_guid: string,
  is_from_me = false
) => {
  return await runSelect(getLastMessageROWIDForChatSQL(chat_guid, is_from_me));
};
const createMessageToSend = async (
  chat_guid: string,
  body: string,
  scheduled_for: Date,
  cancelIfReply = false
) => {
  if (cancelIfReply) {
    const res = await runSelect(getLastMessageROWIDForChatSQL(chat_guid, true));
    const lastRowID = res[0].ROWID;
    await runSelect(
      createMessageToSendSQL(chat_guid, body, scheduled_for, lastRowID)
    );
  } else {
    await runSelect(createMessageToSendSQL(chat_guid, body, scheduled_for));
  }
};

const getMessagesToSend = async (getAll = false) => {
  const results = await runSelect(getTimedMessagesReadyToSendSQL(getAll));
  return results;
};

const updateMessageToSend = async (message_to_send_id: number) => {
  await runSelect(updateTimedMessageSQL(message_to_send_id));
};

const addMemberToBroadcastList = async (id: numer, guid: string) => {
  await runSelect(createBroadcastParticipantSQL(id, guid));
};

const deleteMemberFromBroadcastList = async (id: numer, guid: string) => {
  await runSelect(
    `DELETE FROM broadcast_list_participant where chat_guid="${guid}" AND broadcast_list_id=${id}`
  );
};

const editMessageToSend = async (
  message_to_send_id: number,
  newText: string
) => {
  await runSelect(updateMessageToSendSQL(message_to_send_id, newText));
};

const getMessageToSendFeed = async () => {
  const results = await runSelect(getMessagesToSendFeedSQL);
  return results;
};

const deleteMessageToSend = async (message_to_send_id: number) => {
  await runSelect(cancelMessageToSendSQL(message_to_send_id));
};

const massDeleteReminders = async (type: string) => {
  await runSelect(
    `UPDATE reminder set dismissed_at="${new Date().toISOString()}" where type="${type}"`
  );
};

const createBroadcastList = async (name: string, chat_guids: string) => {
  const results = await runSelect(createBroadcastListSQL(name));
  const newListId = results[0].id;

  for (const x in chat_guids.split(',')) {
    const id = chat_guids.split(',')[x];
    await runSelect(createBroadcastParticipantSQL(newListId, id));
  }
};

const getEmptyBroadcastList = async () => {
  const results = await runSelect('SELECT * from broadcast_list');
  return results;
};

const deleteBroadcastList = async (id: number) => {
  await runSelect(`DELETE FROM broadcast_list where id=${id}`);
  await runSelect(
    `DELETE FROM broadcast_list_participant where broadcast_list_id=${id}`
  );
};
const getBroadcastListGuids = async (
  broadcast_id: number
): Promise<string[]> => {
  const results = await runSelect(
    getChatGuidsForBroadcastListSQL(broadcast_id)
  );
  const data = results[0].guids;
  return data.split(',');
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
  createBroadcastList,
  getBroadcastLists,
  toggleChatMute,
  getIsMuted,
  getLastMessageROWIDForChat,
  getBroadcastListGuids,
  addMemberToBroadcastList,
  deleteMemberFromBroadcastList,
  getEmptyBroadcastList,
  deleteBroadcastList,
};
