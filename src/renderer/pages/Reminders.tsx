import { Box, Card, CircularProgress, Grid, Button } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import mixpanel from 'mixpanel-browser';

import React from 'react';

import { getTimeAgo } from '../util';
import Reminder from 'renderer/components/Reminder';
type Props = {
  getChatUserHandle: (numberList: string[], displayName: string) => void;
  isPaid: boolean;
  nameNumbersLoaded: boolean;
  goToChat: (chatGuid: string) => void;
};

export default function Reminders({
  nameNumbersLoaded,
  getChatUserHandle,
  goToChat,
  isPaid,
}: Props) {
  const [reminders, setReminders] = React.useState([]);

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
      mixpanel.track('Get reminders');
      if (results) setReminders(isPaid ? results : results.slice(0, 5));
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
      <h1 style={{ marginLeft: 20, height: '4vh', fontSize: 22 }}>Reminders</h1>
      <div
        style={{
          overflow: 'scroll',
          width: '100%',
          float: 'left',
          height: '89vh',
          backgroundColor: '#27282A',
        }}
      >
        <Grid container style={{ paddingTop: 10 }}>
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
                      style={{ marginRight: 10, fontSize: 10 }}
                    >
                      Delete all auto reminders
                    </Button>
                  </Grid>
                  <Grid item xs={4}>
                    <Button
                      color="secondary"
                      variant="contained"
                      size="small"
                      style={{ fontSize: 10 }}
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
                {!isPaid && (
                  <Grid item xs={12}>
                    <div
                      style={{
                        backgroundColor: '#d3d3d3',
                        alignContent: 'center',
                        textAlign: 'center',
                        borderRadius: 10,
                        color: 'black',
                        padding: 10,
                        marginTop: 20,
                      }}
                    >
                      <h3>See more than 5 reminders</h3>
                      <a
                        href="https://buy.stripe.com/8wMdR0bLF9VW9SE289"
                        target="_blank"
                        style={{ textDecoration: 'none' }}
                        rel="noreferrer"
                      >
                        <Button
                          variant="contained"
                          style={{
                            marginTop: 10,
                            color: 'black',
                            fontWeight: 'bold',
                          }}
                        >
                          Upgrade
                        </Button>
                      </a>
                    </div>
                  </Grid>
                )}
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
