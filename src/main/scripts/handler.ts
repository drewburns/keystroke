import { exec, execFile } from 'child_process';

const osascript = require('node-osascript');
const { resolve } = require('path');

const testPermission = () => {
  osascript.executeFile(
    resolve(__dirname, 'test.applescript'),
    {},
    function (err, result, raw) {
      if (err) {
        return console.log(err);
      }
    }
  );
};

const sendMessageToChatId = (
  chatId: string,
  body: string,
  isFile = false,
  file = ''
) => {
  console.log('sending message', body, isFile);
  osascript.executeFile(
    resolve(__dirname, 'sendMessageExisting.applescript'),
    {
      message: body,
      chatId,
      isFile,
      filePath: body,
    },
    function (err, result, raw) {
      if (err) {
        return console.log(err);
      }
    }
  );
  // const bashScript = `osascript src/main/scripts/sendMessageExisting.applescript '${chatId}' '${body}'`;
  // console.log(bashScript);
  // return exec(bashScript, null, (error: any, data: any) => {
  //   console.log(data);
  //   console.log(error);
  // });
};

module.exports = {
  sendMessageToChatId,
  testPermission,
};
