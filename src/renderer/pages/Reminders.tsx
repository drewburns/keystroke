import { Box, Card, CircularProgress, Grid, Button } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import mixpanel from 'mixpanel-browser';

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

  mixpanel.init('f5cd229535c67bec6dccbd57ac7ede27');
  const dismissReminder = (reminder_id: string) => {
    window.electron.ipcRenderer.sendMessage('update-reminder', [
      reminder_id,
      'dismissed',
    ]);
    mixpanel.track('Dismiss reminder');

    setReminders(reminders.filter((r) => reminder_id !== r['reminder.id']));
  };

  React.useEffect(() => {
    mixpanel.track('Reminder page loaded');
    window.electron.ipcRenderer.on('get-reminders', (results: any[]) => {
      console.log('results', results);
      mixpanel.track('Get reminders');
      if (results) setReminders(results);
    });

    window.electron.ipcRenderer.sendMessage('get-reminders', null);
  }, []);

  const deleteReminders = (type: string) => {
    mixpanel.track('Delete all reminders', { type });
    window.electron.ipcRenderer.sendMessage('mass-delete-reminders', type);
  };

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
          height: '89vh',
          backgroundColor: '#27282A',
        }}
      >
        <Grid container>
          <Grid item xs={2} />
          <Grid item xs={8}>
            {reminders.length > 0 ? (
              <div>
                <Grid container>
                  <Grid item xs={4}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => deleteReminders('auto')}
                    >
                      Delete all auto reminders
                    </Button>
                  </Grid>
                  <Grid item xs={4}>
                    <Button
                      color="secondary"
                      variant="contained"
                      size="small"
                      onClick={() => deleteReminders('manual')}
                    >
                      Delete all manual reminders
                    </Button>
                  </Grid>
                </Grid>
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
