import { TextField } from '@mui/material';
import React from 'react';

export default function Settings() {
  const [reminderTime, setReminderTime] = React.useState(0);
  React.useEffect(() => {
    window.electron.ipcRenderer.once(
      'get-auto-reminder-time',
      (result: number) => {
        setReminderTime(result);
      }
    );

    window.electron.ipcRenderer.sendMessage('get-auto-reminder-time', null);
  }, []);

  const updateReminderTime = (num: number) => {
    setReminderTime(num);
    window.electron.ipcRenderer.sendMessage('update-auto-reminder-time', num);
  };

  return (
    <div style={{paddingLeft: 15}}>
      <h1 style={{ marginLeft: 0, paddingBottom: 5 }}>Settings</h1>
      <p>Version 4.6.6</p>
      <hr />
      <p>Set how many hours before Keystroke reminds you to respond to a message</p>
      <TextField
        type="number"
        value={reminderTime}
        onChange={(e) => updateReminderTime(e.target.value)}
        style={{ backgroundColor: 'white' }}
      />
    </div>
  );
}
