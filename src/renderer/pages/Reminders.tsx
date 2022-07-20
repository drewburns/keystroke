import { Box, Card, CircularProgress, Grid } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import React from 'react';

import { getTimeAgo } from '../util';
import Reminder from 'renderer/components/Reminder';
type Props = {
  getChatUserHandle: (numberList: string[], displayName: string) => void;
  nameNumbersLoaded: boolean;
  goToChat: (chatGuid: string) => void;
};

export default function Reminders({
  nameNumbersLoaded,
  getChatUserHandle,
  goToChat,
}: Props) {
  const [reminders, setReminders] = React.useState([]);

  const dismissReminder = (reminder_id: string) => {
    window.electron.ipcRenderer.sendMessage('update-reminder', [
      reminder_id,
      'dismissed',
    ]);
    setReminders(reminders.filter((r) => reminder_id !== r['reminder.id']));
  };

  React.useEffect(() => {
    window.electron.ipcRenderer.on('get-reminders', (results: any[]) => {
      console.log('results', results);
      if (results) setReminders(results);
    });

    window.electron.ipcRenderer.sendMessage('get-reminders', null);
  }, []);

  if (!nameNumbersLoaded) {
    return <CircularProgress />;
  }
  return (
    <div>
      <h1 style={{ marginLeft: 20, height: '5vh' }}>Reminders</h1>
      <div
        style={{
          overflow: 'scroll',
          width: '100%',
          float: 'left',
          height: '95vh',
          backgroundColor: '#27282A',
        }}
      >
        <Grid container>
          <Grid item xs={2} />
          <Grid item xs={8}>
            {reminders.length > 0 ? (
              <div>
                {reminders.map((reminder) => (
                  <Reminder
                    getChatUserHandle={getChatUserHandle}
                    reminder={reminder}
                    goToChat={goToChat}
                    dismissReminder={dismissReminder}
                  />
                ))}
              </div>
            ) : (
              <h3 style={{ marginLeft: 20 }}>All caught up :)</h3>
            )}
          </Grid>
        </Grid>
      </div>
    </div>
  );
}
