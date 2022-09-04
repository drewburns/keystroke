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
    <div>
      <h3>Settings</h3>
      <p>Version 4.6.6</p>
      <hr />
      <p>Auto reminder time (alerted after not replying to message)</p>
      <TextField
        type="number"
        value={reminderTime}
        onChange={(e) => updateReminderTime(e.target.value)}
        style={{ backgroundColor: 'white' }}
      />
    </div>
  );
}
