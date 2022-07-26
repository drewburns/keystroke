/* eslint-disable no-plusplus */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint global-require: off, no-console: off, promise/always-return: off */

import { systemPreferences } from 'electron';
import MenuBuilder from './menu';
import mixpanel from 'mixpanel-browser';
import * as Sentry from '@sentry/electron/main';

import checkInternetConnected from 'check-internet-connected';

const config = {
  timeout: 5000, //timeout connecting to each try (default 5000)
  retries: 3, //number of retries to do before failing (default 5)
  domain: 'apple.com', //the domain to check DNS record of
};
// import { getLastMessageROWIDForChat } from './sql';
Sentry.init({
  dsn: 'https://1b2cb5027f6a480aa94fc8f567fe00db@o1338627.ingest.sentry.io/6609806',
});

const Store = require('electron-store');

const store = new Store();
require('update-electron-app')();
const electronLocalshortcut = require('electron-localshortcut');

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
// import path from 'path';
const path = require('path');
const {
  app,
  dialog,
  BrowserWindow,
  shell,
  ipcMain,
  ipcRenderer,
  Notification,
  globalShortcut,
} = require('electron');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
const {
  resolveHtmlPath,
  formatPhoneNumber,
  showMessagePreview,
  getChatUserHandle,
} = require('./util');
const {
  getChatPreviews,
  getNamesForNumbers,
  getChatMessages,
  createReminder,
  getMessageAfterRowId,
  getLatestMessageRowId,
  getBadgeNumber,
  getChatParticipants,
  attemptCreateReminderTable,
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
  getMessageToSendFeed,
  deleteMessageToSend,
  editMessageToSend,
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
} = require('./db');
const { sendMessageToChatId, testPermission } = require('./scripts/handler');

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

// let mainWindow: BrowserWindow | null = null;
let mainWindow = null;

ipcMain.on('get-message-to-send-feed', async (event, arg) => {
  const results = await getMessageToSendFeed();
  event.reply('get-message-to-send-feed', results);
});

ipcMain.on('add-to-broadcast-list', async (event, arg) => {
  const id = arg[0];
  const guid = arg[1];
  await addMemberToBroadcastList(id, guid);
});

ipcMain.on('delete-list', async (event, arg) => {
  const id = arg;
  await deleteBroadcastList(id);
});
ipcMain.on('create-list', async (event, arg) => {
  const name = arg;
  await createBroadcastList(name, '');
  event.reply('create-list', 'OK');
});

ipcMain.on('remove-from-broadcast-list', async (event, arg) => {
  const id = arg[0];
  const guid = arg[1];
  await deleteMemberFromBroadcastList(id, guid);
});

function unique(array: any[], propertyName: string) {
  return array.filter(
    (e, i) => array.findIndex((a) => a[propertyName] === e[propertyName]) === i
  );
}
ipcMain.on('get-broadcast-lists', async (event, arg) => {
  const broadcastResults = (await getBroadcastLists()) || [];
  const empty = (await getEmptyBroadcastList()) || [];
  const allResults = broadcastResults.concat(empty);
  event.reply('get-broadcast-lists', unique(allResults, 'id'));
});

ipcMain.on('toggle-mute', async (event, arg) => {
  await toggleChatMute(arg[0], arg[1]);
});

ipcMain.on('get-is-muted', async (event, arg) => {
  const result = await getIsMuted(arg);
  event.reply('get-is-muted', result);
});

ipcMain.on('create-broadcast-list', async (event, arg) => {
  await createBroadcastList(arg[0], arg[1]);
  // event.reply('get-message-to-send-feed', results);
});

ipcMain.on('get-auto-reminder-time', async (event, arg) => {
  const result = store.get('auto-reminder-default-hours');
  event.reply('get-auto-reminder-time', result);
});

ipcMain.on('get-access-code', async (event, arg) => {
  const result = store.get('access-code');
  event.reply('get-access-code', result);
});

ipcMain.on('set-access-code', async (event, arg) => {
  store.set('access-code', arg);
});

ipcMain.on('update-auto-reminder-time', async (event, arg) => {
  store.set('auto-reminder-default-hours', arg);
});

ipcMain.on('delete-message-to-send', async (event, arg) => {
  await deleteMessageToSend(arg);
});

ipcMain.on('edit-message-to-send', async (event, arg) => {
  await editMessageToSend(arg[0], arg[1].replace(/["']/g, '“'));
});
// editMessageToSend

ipcMain.on('get-reminders', async (event, arg) => {
  const results = await getReminders(arg || 0);
  event.reply('get-reminders', results);
});

ipcMain.on('mass-delete-reminders', async (event, arg) => {
  await massDeleteReminders(arg);
  const results = await getReminders();
  event.reply('get-reminders', results);
});

ipcMain.on('set-chat-read', async (event, arg) => {
  const chatGuid = arg[0];
  await setMessagesToReadForChat(chatGuid);
});

ipcMain.on('update-reminder', async (event, arg) => {
  const reminder_id = arg[0];
  const newStatus = arg[1];
  console.log(reminder_id, newStatus);
  await updateReminder(reminder_id, newStatus);
});

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  event.reply('ipc-example', msgTemplate('pong'));
});

ipcMain.on('showFile', async (event, arg) => {
  shell.openPath(arg.substring(7));
  // console.log(dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] }))
});

ipcMain.on('get-messages', async (event, arg) => {
  const chatGuid = arg[0];
  const results = await getChatMessages(chatGuid, 30);
  event.reply('get-messages', results);
});

ipcMain.on('create-user-reminder', async (event, arg) => {
  const message_id = arg[0];
  const remind_at = arg[1];
  const chat_id = arg[2];
  const note = arg[3];

  await createReminder(message_id, remind_at, chat_id, note, 'manual');
});

ipcMain.on('get-chat-participants', async (event, arg) => {
  let results = await getChatParticipants();
  const broadcastResults = await getBroadcastLists();
  if (!broadcastResults) {
    event.reply('get-chat-participants', results);
    return;
  }
  results = results.concat(
    broadcastResults.map((list) => ({
      display_name: list.name + ' [Broadcast List]',
      part_list: list.part_list,
      broadcast_list_id: list.broadcast_list_id,
    }))
  );

  event.reply('get-chat-participants', results);
});

ipcMain.on('send-message', async (event, arg) => {
  const chatGuid = arg[0];
  const body = arg[1];
  const isFile = arg[2] || false;
  const messageIdFromReminder = arg[3] || null;
  const sendAt = arg[4] || null;
  const cancelIfReply = arg[5] || false;
  if (sendAt) {
    await createMessageToSend(
      chatGuid,
      body.replace(/["']/g, '“'),
      sendAt,
      cancelIfReply
    );
    return;
  }
  await sendMessageToChatId(chatGuid, body.replace(/["']/g, '“'), isFile);
  await updateAutoChatGuidReminders(chatGuid);
  if (messageIdFromReminder) {
    await updateManualReminderByMessageId(messageIdFromReminder);
  }
});

ipcMain.on('send-to-broadcast-id', async (event, arg) => {
  mixpanel.init('f5cd229535c67bec6dccbd57ac7ede27');
  const broadcastId = arg[0];
  const chatGuidsToIgnore = arg[1];
  const body = arg[2];
  var sendAt = arg[3] || new Date();
  const cancelIfReply = arg[4] || false;
  const broadcastGuids = await getBroadcastListGuids(broadcastId);
  const uniqueBroadcastGuids = broadcastGuids.filter(
    (x) => !chatGuidsToIgnore.includes(x)
  );
  const nameNumbers = await getNamesForNumbers();
  const tempData = {};
  nameNumbers.forEach((row: any) => {
    const number = formatPhoneNumber(row.ZFULLNUMBER);
    const name = `${row.ZFIRSTNAME}`;
    tempData[number] = name;
  });
  mixpanel.track('broadcast-send-backend', {
    num: uniqueBroadcastGuids.length,
  });
  for (let x = 0; x < uniqueBroadcastGuids.length; x++) {
    const chatGuid = uniqueBroadcastGuids[x];
    const secondsOffset = Math.floor(x / 20) * (60 * 10);
    const name = tempData[formatPhoneNumber(chatGuid.split(';')[2])];
    const parsedBody = body.replace(/["']/g, '“').replace('{first_name}', name);

    sendAt.setSeconds(sendAt.getSeconds() + secondsOffset);
    if (sendAt) {
      await createMessageToSend(chatGuid, parsedBody, sendAt, cancelIfReply);
      continue;
    }
    await sendMessageToChatId(chatGuid, parsedBody, false);
    await updateAutoChatGuidReminders(chatGuid);
  }
});

ipcMain.on('fetch-more', async (event, arg) => {
  const chatGuid = arg[0];
  const lastRowID = arg[1];
  const results = await getChatMessages(chatGuid, 30, lastRowID);
  event.reply('new-message', { isLoadMore: true, data: results });
});
// mainWindow?.webContents.send('new-message', results);

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  app.dock.setIcon(getAssetPath('icon.png'));

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      webSecurity: false,
      devTools: true,
      spellcheck: true,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  electronLocalshortcut.register(mainWindow, 'CommandOrControl+N', () => {
    mainWindow.webContents.send('go-to-page-keypress', 'newChat');
  });
  electronLocalshortcut.register(mainWindow, 'CommandOrControl+B', () => {
    mainWindow.webContents.send('go-to-page-keypress', 'broadcast');
  });
  electronLocalshortcut.register(mainWindow, 'CommandOrControl+Up', () => {
    mainWindow.webContents.send('go-to-page-keypress', 'upChat');
  });
  electronLocalshortcut.register(mainWindow, 'CommandOrControl+T', () => {
    mainWindow.webContents.send('go-to-page-keypress', 'timedMessages');
  });
  electronLocalshortcut.register(mainWindow, 'CommandOrControl+Down', () => {
    mainWindow.webContents.send('go-to-page-keypress', 'downChat');
  });
  electronLocalshortcut.register(mainWindow, 'CommandOrControl+E', () => {
    mainWindow.webContents.send('go-to-page-keypress', 'reminders');
  });
  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

const runBoot = async () => {
  await attemptCreateReminderTable();
};
const runScanHelper = async () => {
  // const output = execSync('echo "hello world"', { encoding: 'utf-8' }); // the default is 'buffer'
  // console.log('Output was:\n', output);
  checkInternetConnected(config)
    .then(async () => {
      const rows = await getChatPreviews();
      mainWindow?.webContents.send('asynchronous-message', { data: rows });

      await createAutoReminders();
      await sendTimedMessage();
      await scanTimedMessageToDelete();
      const badgeNum = await getBadgeNumber();
      app.dock.setBadge(badgeNum[0].count.toString());

      mainWindow?.webContents.send(
        'get-acccess-code',
        store.get('access-code')
      );
    })
    .catch((err) => {
      console.log('No connection', err);
    });
};

const scanTimedMessageToDelete = async () => {
  const results = await getMessagesToSend(true);
  for (const x in results) {
    const row = results[x];
    const res = await getLastMessageROWIDForChat(row.chat_guid, true);
    if (
      row.cancel_if_last_message_above &&
      res[0].ROWID > row.cancel_if_last_message_above
    ) {
      console.log('canceling message');
      await deleteMessageToSend(row.id);
      return;
    }
  }
};

const sendTimedMessage = async () => {
  const results = await getMessagesToSend();
  // eslint-disable-next-line guard-for-in
  for (const x in results) {
    const row = results[x];
    const res = await getLastMessageROWIDForChat(row.chat_guid, true);
    if (
      row.cancel_if_last_message_above &&
      res[0].ROWID > row.cancel_if_last_message_above
    ) {
      console.log('canceling message');
      await deleteMessageToSend(row.id);
      return;
    }
    await sendMessageToChatId(
      row.chat_guid,
      row.body.replace(/["']/g, '“'),
      false
    );
    await updateAutoChatGuidReminders(row.chat_guid);
    await updateMessageToSend(row.id);
  }
};

const runNameNumbers = async () => {
  // const output = execSync('echo "hello world"', { encoding: 'utf-8' }); // the default is 'buffer'
  // console.log('Output was:\n', output);
  const rows = await getNamesForNumbers();
  mainWindow?.webContents.send('name-numbers', { data: rows });
};

// eslint-disable-next-line promise/param-names
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const checkForNewMessage = async () => {
  // await getMessageAfterRowId()
  let lastSeenRowId = (await getLatestMessageRowId())[0].ROWID;
  while (true) {
    const results = await getMessageAfterRowId(lastSeenRowId);
    const nameNumbers = await getNamesForNumbers();
    const tempData = {};
    nameNumbers.forEach((row: any) => {
      const number = formatPhoneNumber(row.ZFULLNUMBER);
      const name = `${row.ZFIRSTNAME} ${row.ZLASTNAME || ''}`;
      tempData[number] = name;
    });
    if (results) {
      lastSeenRowId =
        results[0]['message.ROWID'] || lastSeenRowId + results.length;
      mainWindow?.webContents.send('new-message', { data: results });
      results.forEach((row: any) => {
        if (row.is_from_me === 0 && row.ks_muted !== 1) {
          new Notification({
            title: getChatUserHandle(
              tempData,
              row.member_list.split(','),
              row.display_name
            ),
            body: showMessagePreview(row) || row.text,
          }).show();
        }
      });
    }
    await delay(1000);
  }
};

async function runScan() {
  // do whatever you like here
  runScanHelper();
  runNameNumbers();

  setTimeout(runScan, 5000);
}

runBoot();
runScan();
checkForNewMessage();

app
  .whenReady()
  .then(() => {
    createWindow();
    testPermission();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
