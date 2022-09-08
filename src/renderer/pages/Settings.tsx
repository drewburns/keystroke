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
    <div style={{ paddingLeft: 20 }}>
      <h1 style={{ marginLeft: 0, paddingBottom: 5, fontSize: 22 }}>
        Settings
      </h1>
      <p>Version 4.6.8</p>
      <hr />
      <p>
        Set how many hours before Keystroke reminds you to respond to a message
      </p>
      <TextField
        type="number"
        value={reminderTime}
        onChange={(e) => updateReminderTime(e.target.value)}
        style={{ backgroundColor: 'white' }}
      />
      <p>Text Andrew: +1 860 734 6043 or Luke: +1 218 348 0139 for support</p>
    </div>
  );
}
