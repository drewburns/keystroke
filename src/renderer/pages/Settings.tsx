import { Button, TextField } from '@mui/material';
import React from 'react';

type Props = {
  tryCode: (code: string) => void;
  isPaid: boolean;
};
export default function Settings({ tryCode, isPaid }: Props) {
  const [code, setCode] = React.useState('');
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
      <p>Version 4.6.17</p>
      <hr />
      <p>
        Set how many hours before Keystroke reminds you to respond to a message
        (default 12)
      </p>
      <TextField
        type="number"
        value={reminderTime}
        onChange={(e) => updateReminderTime(e.target.value)}
        style={{ backgroundColor: 'white' }}
      />
      <p>Text Andrew: +1 860 734 6043 or Luke: +1 218 348 0139 for support</p>
      <p>For plan adjustments, contact us</p>
      <hr />
      {!isPaid && (
        <div>
          {' '}
          <h3>Need an access code?</h3>
          <a
            style={{
              color: 'white',
              fontWeight: 'bold',
              textDecoration: 'underline',
            }}
            target="_blank"
            href="https://buy.stripe.com/8wMdR0bLF9VW9SE289"
            rel="noreferrer"
          >
            Click here to purchase a code (30 free trial, cancel anytime!)
          </a>
          <h3>Enter your access code:</h3>
          <TextField
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            id="outlined-basic"
            label="code"
            variant="filled"
            placeholder="Access code..."
            style={{ marginTop: 10, backgroundColor: 'white' }}
          />
          <br />
          <Button variant="contained" onClick={() => tryCode(code)}>
            Enter
          </Button>
        </div>
      )}
    </div>
  );
}
