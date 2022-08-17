const Store = require('electron-store');
const store = new Store();

export const createReminderTable = `
CREATE TABLE IF NOT EXISTS reminder(
  id             INTEGER PRIMARY KEY     NOT NULL,
  message_id     INT     NOT NULL UNIQUE,
  created_at     datetime default current_timestamp,
  remind_at      datetime,
  chat_id        TEXT    NOT NULL,
  note           TEXT,
  completed_at   datetime,
  dismissed_at   datetime,
  type           TEXT default "manual"
)`; // chat_id = chat_guid

export const createBroadcastListTable = `
CREATE TABLE IF NOT EXISTS broadcast_list(
  id             INTEGER PRIMARY KEY     NOT NULL,
  name           TEXT     NOT NULL,
  created_at     datetime default current_timestamp
)
`;

export const createBroadcastListHandleTable = `
CREATE TABLE IF NOT EXISTS broadcast_list_participant(
  broadcast_list_id INTEGER,
  chat_guid     TEXT,
  PRIMARY KEY (broadcast_list_id, chat_guid)
)
`;

export const createMessageToSendTable = `
CREATE TABLE IF NOT EXISTS message_to_send(
  id             INTEGER PRIMARY KEY     NOT NULL,
  created_at     datetime default current_timestamp,
  chat_guid        TEXT    NOT NULL,
  body           TEXT NOT NULL,
  cancel_if_last_message_above INTEGER,
  scheduled_for   datetime,
  sent_at   datetime
)
`;

export const addLastMessageToSendLastMessageRowID = `
  ALTER TABLE message_to_send
  ADD cancel_if_last_message_above INTEGER;
`;

export const addMuteToChat = `
  ALTER TABLE chat
  ADD ks_muted BOOLEAN;
`;

export const createBroadcastListSQL = (name: string) => {
  return `
    INSERT INTO broadcast_list (name, created_at) VALUES 
    ("${name}", "${new Date().toISOString()}") RETURNING *;
  `;
};

// TODO: get their handle for mail merge
export const getChatGuidsForBroadcastListSQL = (broadcast_id: number) => {
  return `
    SELECT GROUP_CONCAT(chat.guid) as "guids" FROM broadcast_list
    JOIN broadcast_list_participant ON broadcast_list.id=broadcast_list_participant.broadcast_list_id
    JOIN chat ON broadcast_list_participant.chat_guid=chat.guid
    WHERE broadcast_list.id=${broadcast_id}
    GROUP BY broadcast_list.id
  `;
};

export const createBroadcastParticipantSQL = (
  broadcast_list_id: number,
  chat_guid: string
) => {
  return `
  INSERT INTO broadcast_list_participant (broadcast_list_id, chat_guid) VALUES 
  (${broadcast_list_id},"${chat_guid}");
  `;
};

export const getHandleRowIDsForChatGuidsSQL = (chat_guids: string) => {
  return `
    SELECT GROUP_CONCAT(handle.ROWID) as "handle_rowid_list" FROM
    chat
    JOIN chat_handle_join ON chat_handle_join.chat_id = chat.ROWID
    JOIN handle on chat_handle_join.handle_id=handle.ROWID
    WHERE chat.guid IN (${chat_guids});
  `;
};

export const getBroadcastListsSQL = `
  SELECT GROUP_CONCAT(chat.guid) as "part_list",
  * from broadcast_list
  JOIN broadcast_list_participant on broadcast_list.id = broadcast_list_participant.broadcast_list_id
  JOIN chat on broadcast_list_participant.chat_guid = chat.guid
  GROUP BY broadcast_list.id
`;


// select chat.guid,display_name, GROUP_CONCAT(handle.id) as part_list
// from chat
// left join chat_handle_join on chat.ROWID = chat_handle_join.chat_id
// left  join handle on handle.ROWID = chat_handle_join.handle_id group by chat.guid;
export const getMessagesToSendFeedSQL = `
SELECT GROUP_CONCAT(handle.id) as part_list, chat.display_name AS "chat.display_name", message_to_send.*
from message_to_send
JOIN chat on  message_to_send.chat_guid = chat.guid
left join chat_handle_join on chat.ROWID = chat_handle_join.chat_id
left  join handle on handle.ROWID = chat_handle_join.handle_id 
WHERE sent_at IS NULL
group by chat.guid
`;

export const cancelMessageToSendSQL = (message_to_send_id: number) => {
  return `
    DELETE FROM message_to_send where id=${message_to_send_id}
  `;
};

export const updateMessageToSendSQL = (
  message_to_send_id: number,
  newText: string
) => {
  return `
    UPDATE message_to_send 
    set
    body="${newText}"
     where id=${message_to_send_id};
  `;
};

export const createMessageToSendSQL = (
  chat_guid: string,
  body: string,
  scheduled_for: Date,
  lastRowID = null
) => {
  if (lastRowID) {
    return `INSERT INTO message_to_send
    (created_at, chat_guid, scheduled_for, body, cancel_if_last_message_above)
    VALUES ("${new Date().toISOString()}",
     "${chat_guid}",  "${scheduled_for.toISOString()}", "${body}", ${lastRowID});
    `;
  }
  return `INSERT INTO message_to_send
    (created_at, chat_guid, scheduled_for, body)
    VALUES ("${new Date().toISOString()}",
     "${chat_guid}",  "${scheduled_for.toISOString()}", "${body}");
    `;
};

export const getTimedMessagesReadyToSendSQL = (getAll = false) => {
  // TODO: do this all in one SQL query
  if (getAll) {
    return `
    SELECT * from message_to_send WHERE sent_at IS NULL
  `;
  }
  return `
  SELECT * from message_to_send WHERE
  datetime(scheduled_for, 'localtime') < datetime(current_timestamp, 'localtime') AND sent_at IS NULL
`;
};

export const deleteTimedMessageSQL = (message_to_send_id: number) => {
  return `
  DELETE from message_to_send where id=${message_to_send_id};
  `;
};
export const updateTimedMessageSQL = (message_to_send_id: number) => {
  return `
    UPDATE message_to_send set sent_at="${new Date().toISOString()}" where id=${message_to_send_id}
  `;
};

export const getUnrepliedMessagesSQL = (hours: number) => {
  return `
  SELECT text, chat.guid as "chat.guid", message.ROWID as "message.ROWID"
  FROM message
  LEFT JOIN chat_message_join ON chat_message_join.message_id = message.ROWID
  LEFT JOIN chat ON chat.ROWID = chat_message_join.chat_id
  WHERE message.ROWID IN (
      SELECT MAX(message.ROWID)
      FROM message
      LEFT JOIN chat_message_join ON chat_message_join.message_id = message.ROWID
      LEFT JOIN chat ON chat.ROWID = chat_message_join.chat_id
      GROUP BY chat.guid
  ) AND message.is_from_me=0 AND datetime(SUBSTR(message.date, 1, 9) + strftime('%s', '2001-01-01 00:00:00'),'unixepoch', 'localtime') < datetime('now', '-${
    hours || 24
  } hour', 'localtime')
  AND message.ROWID NOT IN (select message_id from reminder);
`;
};

export const getLastMessageROWIDForChatSQL = (
  chatGuid: string,
  notFromMe = false
) => {
  return `
  SELECT message.ROWID as "ROWID"
  FROM message
  LEFT JOIN chat_message_join ON chat_message_join.message_id = message.ROWID
  LEFT JOIN chat ON chat.ROWID = chat_message_join.chat_id
  WHERE message.ROWID IN (
      SELECT MAX(message.ROWID)
      FROM message
      LEFT JOIN chat_message_join ON chat_message_join.message_id = message.ROWID
      LEFT JOIN chat ON chat.ROWID = chat_message_join.chat_id
      ${notFromMe ? 'WHERE message.is_from_me=0' : ''}
      GROUP BY chat.guid
  ) AND chat.guid="${chatGuid}"`;
};

export const getChatGuidsLastMessageMeSQL = `
SELECT text, chat.guid as "chat.guid", message.ROWID as "message.ROWID"
FROM message
LEFT JOIN chat_message_join ON chat_message_join.message_id = message.ROWID
LEFT JOIN chat ON chat.ROWID = chat_message_join.chat_id
WHERE message.ROWID IN (
    SELECT MAX(message.ROWID)
    FROM message
    LEFT JOIN chat_message_join ON chat_message_join.message_id = message.ROWID
    LEFT JOIN chat ON chat.ROWID = chat_message_join.chat_id
    GROUP BY chat.guid
) AND message.is_from_me=1`;

export const updateReminderSQL = (
  reminder_id: number,
  newStatus = 'dismissed'
): string => {
  if (newStatus === 'dismissed') {
    return `
      UPDATE reminder set dismissed_at='${new Date().toISOString()}' where id=${reminder_id};
    `;
  }
  return `
  UPDATE reminder set completed_at='${new Date().toISOString()}' where id=${reminder_id};
    `;
};

export const createAutoReminderSQL = (rows: any[]): string => {
  let sql = '';
  rows.forEach((r: any) => {
    const now = new Date();
    sql += `
    INSERT INTO reminder (message_id, remind_at, chat_id, type) VALUES
    (${r['message.ROWID']}, '${now.toISOString()}', '${
      r['chat.guid']
    }', 'auto');
  `;
  });
  return sql;
};

export const updateAutoChatGuidRemindersSQL = (chatGuid: string) => {
  return `
    UPDATE reminder set completed_at='${new Date().toISOString()}' where chat_id='${chatGuid}'
    AND type='auto';
  `;
};

export const updateManualReminderByMessageIdSQL = (messageRowId: number) => {
  return `
    UPDATE reminder set completed_at='${new Date().toISOString()}' where message_id='${messageRowId}';
  `;
};

export const getRemindersSQL = (page = 0) => {
  const pageSize = 50;
  return `
  SELECT
  *,
  reminder.message_id as "reminder.message_id",
  GROUP_CONCAT(handle.id) AS member_list,
  reminder.id as "reminder.id",
  handle.id as "sender.number",
  chat.guid as "chat.guid",
  chat.ks_muted,
  reminder.type as "reminder_type",
  GROUP_CONCAT(filename) as "attach_list",
  GROUP_CONCAT(mime_type) as "mime_list",
  datetime(SUBSTR(message.date, 1, 9) + strftime('%s', '2001-01-01 00:00:00'),'unixepoch', 'localtime') AS "message.date",
  message.text from reminder
  LEFT JOIN chat ON chat.guid = reminder.chat_id
  LEFT JOIN chat_handle_join ON chat_handle_join.chat_id = chat.ROWID
  LEFT JOIN handle on handle.ROWID = chat_handle_join.handle_id
  LEFT JOIN message on reminder.message_id = message.ROWID
  LEFT JOIN message_attachment_join ON message_attachment_join.message_id = message.ROWID
  LEFT JOIN attachment ON message_attachment_join.attachment_id = attachment.ROWID
  WHERE datetime(reminder.remind_at, 'localtime') < datetime(current_timestamp, 'localtime')
  AND reminder.completed_at IS NULL AND reminder.dismissed_at IS NULL
  GROUP BY message.ROWID ORDER BY reminder.created_at desc LIMIT ${pageSize};
`;
};

export const createReminderInsertSQL = (
  message_id: string,
  remind_at: string,
  chat_id: number,
  note = '',
  type = 'manual'
): string => {
  // TODO: this aint so great but use at your own risk playa
  return `INSERT INTO reminder (type, message_id, remind_at, chat_id, note)
    VALUES ('${type}', ${message_id}, '${remind_at}', '${chat_id}', '${note.replace(
    /["']/g,
    '“'
  )}')`;
};

export const getChatPreviewSQL = `SELECT chat.guid AS "chat.guid", chat.display_name AS "chat.display_name",
chat.service_name AS "chat.service_name",
chat.ks_muted,
GROUP_CONCAT(handle.id) AS member_list
FROM chat
JOIN chat_handle_join ON chat.ROWID = chat_handle_join.chat_id
JOIN handle ON chat_handle_join.handle_id = handle.ROWID
GROUP BY chat.ROWID
`;

export const findMessagesToMarkReadInChatIDSQL = (chatId: string) => {
  return `
  select message.ROWID
  from message JOIN chat_message_join ON chat_message_join.message_id = message.ROWID
  JOIN chat on chat.ROWID = chat_message_join.chat_id
  where chat.guid='${chatId}' and message.is_read=0 and message.is_from_me=0;
`;
};

export const setMessagesToReadSQL = (ids: number[]) => {
  const idString = ids.join(',');
  return `
  UPDATE message set is_read=1, date_read=123 where ROWID IN (${idString})
  `;
};

export const getChatParticipantSQL = `
select chat.guid,display_name, GROUP_CONCAT(handle.id) as part_list
from chat
left join chat_handle_join on chat.ROWID = chat_handle_join.chat_id
left  join handle on handle.ROWID = chat_handle_join.handle_id group by chat.guid;
`;

export const getBadgeNumberSQL = `
  select count(*) as count from message where is_read=0 and is_from_me=0;
`;

export const toggleChatMuteSQL = (chatGuid: string, val: boolean) => {
  return `UPDATE chat set ks_muted=${val} where guid="${chatGuid}"`;
};

export const getAllChatSummary = `SELECT
chat.guid AS "chat.guid",
chat.ks_muted,
chat.display_name AS "chat.display_name",
chat.service_name AS "chat.service_name",
message.text AS "message.text",
message.is_from_me as "message.is_from_me",
datetime(SUBSTR(message.date, 1, 9) + strftime('%s', '2001-01-01 00:00:00'),'unixepoch', 'localtime') AS "message.date",
datetime(SUBSTR(message.date_read, 1, 9) + strftime('%s', '2001-01-01 00:00:00'),'unixepoch', 'localtime') AS "message.date_read",
message.is_read AS "message.is_read",
message.is_from_me AS "message.is_from_me",
handle.id AS "handle.id",
sub2.member_list AS member_list,
GROUP_CONCAT(attachment.mime_type) AS attach_list
FROM (
/* Join chats to members, concat to member_list */
SELECT
  sub1.*,
  GROUP_CONCAT(handle.id) AS member_list
FROM (
  /* Select the most recent message per chat */
  SELECT
    chat.ROWID AS chat_id,
    message.ROWID AS message_id,
    MAX(message.date)
  FROM chat
  JOIN chat_message_join ON chat.ROWID = chat_message_join.chat_id
  JOIN message ON chat_message_join.message_id = message.ROWID
  WHERE message.item_type = 0
  GROUP BY chat.ROWID
) AS sub1
JOIN chat_handle_join ON chat_handle_join.chat_id = sub1.chat_id
JOIN handle ON chat_handle_join.handle_id = handle.ROWID
GROUP BY sub1.chat_id
) AS sub2
JOIN chat ON chat.ROWID = sub2.chat_id
JOIN message ON message.ROWID = sub2.message_id
LEFT JOIN message_attachment_join ON message_attachment_join.message_id = sub2.message_id
LEFT JOIN attachment ON message_attachment_join.attachment_id = attachment.ROWID
LEFT JOIN handle ON message.handle_id = handle.ROWID
GROUP BY chat.ROWID
ORDER BY message.date DESC
`;

export const getNamesForNumbersSQL = `select ZABCDPHONENUMBER.ZFULLNUMBER, ZFIRSTNAME, ZLASTNAME from ZABCDPHONENUMBER left join ZABCDRECORD on ZABCDPHONENUMBER.ZOWNER = ZABCDRECORD.Z_PK;`;

export const generateNewMessageQuery = (lastRowIdSeen: number) => {
  return `
SELECT message.ROWID as "message.ROWID", chat.guid as "chat.guid",
chat.ks_muted,
sender_handle.id as "sender.number",
GROUP_CONCAT(filename) as "attach_list",
GROUP_CONCAT(mime_type) as "mime_list",
GROUP_CONCAT(sender_handle.id) AS member_list,
datetime(SUBSTR(message.date, 1, 9) + strftime('%s', '2001-01-01 00:00:00'),'unixepoch', 'localtime') AS "message.date",
datetime(SUBSTR(message.date_read, 1, 9) + strftime('%s', '2001-01-01 00:00:00'),'unixepoch', 'localtime') AS "message.date_read"
,*
FROM message
    JOIN chat_message_join ON message.ROWID = chat_message_join.message_id
    JOIN chat ON chat_message_join.chat_id = chat.ROWID
    LEFT JOIN message_attachment_join ON message_attachment_join.message_id = message.ROWID
    LEFT JOIN attachment ON message_attachment_join.attachment_id = attachment.ROWID
    LEFT JOIN handle AS sender_handle ON message.handle_id = sender_handle.ROWID
    where message.ROWID > ${lastRowIdSeen} GROUP BY message.ROWID order by message.ROWID desc limit 1;`;
};

export const generateMessageSearchQuery = (
  chatGuid: string,
  limit: number,
  lastRowID = 999999999999999
) => {
  return `SELECT message.ROWID as "message.ROWID", chat.guid as "chat.guid",
  sender_handle.id as "sender.number",
  datetime(SUBSTR(message.date_read, 1, 9) + strftime('%s', '2001-01-01 00:00:00'),'unixepoch', 'localtime') AS "message.date_read",
  GROUP_CONCAT(filename) as "attach_list",
  GROUP_CONCAT(mime_type) as "mime_list",
  *
  FROM message
      JOIN chat_message_join ON message.ROWID = chat_message_join.message_id
      JOIN chat ON chat_message_join.chat_id = chat.ROWID
      LEFT JOIN message_attachment_join ON message_attachment_join.message_id = message.ROWID
      LEFT JOIN attachment ON message_attachment_join.attachment_id = attachment.ROWID
      LEFT JOIN handle AS sender_handle ON message.handle_id = sender_handle.ROWID
      LEFT JOIN handle AS other_handle ON message.other_handle = other_handle.ROWID where chat.guid='${chatGuid}' and message.ROWID < ${lastRowID} group by message.ROWID order by message.date desc limit ${limit};`;
};

/*
 Find all chats where last message is not from me
 SELECT * from chat
 LEFT JOIN chat_message_join ON chat_message_join.chat_id = chat.ROWID
 LEFT JOIN message ON message.ROWID = chat_message_join.message_id
 OR


*/
