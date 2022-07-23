/* eslint-disable @typescript-eslint/naming-convention */
import { Box, Select, TextField, MenuItem, Button } from '@mui/material';
import mixpanel from 'mixpanel-browser';

import React from 'react';

type Props = { message: any; setMessageForRemindCreate: (obj: any) => void };

export default function CreateReminderModal({
  message,
  setMessageForRemindCreate,
}: Props) {
  const [note, setNote] = React.useState('');
  const [timeAmount, setTimeAmount] = React.useState(1);
  const [timeDenom, setTimeDenom] = React.useState(60 * 60);

  mixpanel.init('f5cd229535c67bec6dccbd57ac7ede27');

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '75%',
    maxWidth: '300px',
    alignItems: 'center',
    alignContent: 'center',
    // display: 'flex',
    textAlign: 'center',
    justifyContent: 'center',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'black',
    border: '1px #d3d3d3 solid',
    boxShadow: 24,
    p: 4,
  };

  const onCreate = () => {
    const message_id = message['message.ROWID'];
    const remind_at = new Date(Date.now() + timeAmount * (timeDenom * 1000));
    const chat_id = message['chat.guid'];
    window.electron.ipcRenderer.sendMessage('create-user-reminder', [
      message_id,
      remind_at,
      chat_id,
      note,
    ]);
    mixpanel.track('Create reminder', {
      isNote: !!note,
      timeAmount: timeAmount * (timeDenom * 1000),
    });

    setMessageForRemindCreate({}); // close modal
  };

  return (
    <Box sx={style}>
      <h3>Create reminder</h3>
      <i>Remind me to respond in:</i>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
        }}
      >
        <TextField
          type="number"
          value={timeAmount}
          onChange={(e) => setTimeAmount(parseInt(e.target.value))}
          style={{ marginTop: 20, backgroundColor: 'white', width: 80 }}
        />
        <Select
          id="demo-simple-select"
          style={{ backgroundColor: 'white', height: 60, marginTop: 19 }}
          value={timeDenom}
          label="Age"
          onChange={(e) => setTimeDenom(e.target.value)}
        >
          <MenuItem value={60}>Minutes</MenuItem>
          <MenuItem value={60 * 60}>Hours</MenuItem>
          <MenuItem value={60 * 60 * 24}>Days</MenuItem>
        </Select>
      </div>
      <TextField
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        id="outlined-basic"
        label="Note"
        variant="filled"
        placeholder="note..."
        style={{ marginTop: 20, backgroundColor: 'white' }}
      />
      <br />
      <Button
        style={{ marginTop: 10 }}
        variant="contained"
        fullWidth
        onClick={onCreate}
      >
        Create
      </Button>
    </Box>
  );
}
