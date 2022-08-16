import { exec, execFile } from 'child_process';
import { fixPathForAsarUnpack } from 'electron-util';

const osascript = require('node-osascript');
const { resolve } = require('path');

const testPermission = () => {
  const file = fixPathForAsarUnpack(
    resolve(__dirname, 'scripts/test.applescript')
  );
  try {
    // const file = resolve(__dirname, 'scripts/test.applescript');
    const script = `
    tell application "Messages"
      count windows
    end tell`;
    osascript.execute(
      script,
      { varName: 'value' },
      function (err, result, raw) {}
    );
    // osascript.executeFile(file, {}, function (err, result, raw) {
    //   if (err) {
    //     throw new Error('testing');
    //     return console.log(err);
    //   }
    // });
  } catch (err) {
    console.log('fixed path');
    console.log(file);
    console.log('this err', err);
    throw new Error('testing');
  }
};

const sendMessageToChatId = (
  chatId: string,
  body: string,
  isFile = false,
  file = ''
) => {
  console.log('sending message', body, isFile);
  const filePath = fixPathForAsarUnpack(
    resolve(__dirname, 'scripts/sendMessageExisting.applescript')
  );
  // const filePath = resolve(__dirname, 'scripts/sendMessageExisting.applescript');
  const script = `
    if isFile then
      set message to POSIX file filePath
    end if

    tell application "Messages"
      send message to chat id chatID
    end tell
  `;
  osascript.execute(
    script,
    {
      message: body,
      chatId,
      isFile,
      filePath: body,
    },
    function (err, result, raw) {
      if (err) {
        console.log(err);
      }
    }
  );
  // osascript.executeFile(
  //   filePath,
  // {
  //   message: body,
  //   chatId,
  //   isFile,
  //   filePath: body,
  // },
  //   function (err, result, raw) {
  //     if (err) {
  //       // throw new Error(err);
  //       console.log(filePath);
  //       return console.log(err);
  //     }
  //   }
  // );
};

module.exports = {
  sendMessageToChatId,
  testPermission,
};
