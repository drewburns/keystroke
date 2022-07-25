import { Button, Card, Grid } from '@mui/material';
import React from 'react';

type Props = {
  getChatUserHandle: (list: string[], displayName: string) => string;
};

export default function TimedMessageFeed({ getChatUserHandle }: Props) {
  const [messages, setMessages] = React.useState([]);
  React.useEffect(() => {
    window.electron.ipcRenderer.once(
      'get-message-to-send-feed',
      (results: any) => {
        setMessages(results);
      }
    );
    window.electron.ipcRenderer.sendMessage('get-message-to-send-feed');
  }, [messages]);

  const deleteMessageToSend = (id: number) => {
    window.electron.ipcRenderer.sendMessage('delete-message-to-send', id);
    setMessages(messages.filter((m) => m.id !== id));
  };

  function timeToGo(d: Date) {
    // Utility to add leading zero
    function z(n) {
      return (n < 10 ? '0' : '') + n;
    }

    // Convert string to date object
    let diff = d - new Date();

    // Allow for previous times
    const sign = diff < 0 ? '-' : '';
    diff = Math.abs(diff);

    // Get time components
    const hours = (diff / 3.6e6) | 0;
    const mins = ((diff % 3.6e6) / 6e4) | 0;
    const secs = Math.round((diff % 6e4) / 1e3);

    // Return formatted string
    return `${sign + z(hours)}:${z(mins)}:${z(secs)}`;
  }
  if (!messages) {
    return (
      <div>
        <h3>Timed Message Feed</h3>
        <h4>None!</h4>
      </div>
    );
  }
  return (
    <div>
      <h3>Timed Message Feed</h3>
      <Grid container>
        <Grid item xs={2} />
        <Grid item xs={8}>
          {messages &&
            messages.map((m) => (
              <Card
                variant="outlined"
                className="reminderCard"
                style={{
                  backgroundColor: '#373737',
                  color: 'white',
                  paddingLeft: 5,
                }}
              >
                <p
                  style={{
                    marginTop: 5,
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                  }}
                >
                  To:{' '}
                  {m.part_list &&
                    getChatUserHandle(
                      m.part_list.split(','),
                      m['chat.display_name']
                    )}
                </p>
                <p>Body: {m.body}</p>
                <i>Sending in {timeToGo(new Date(m.scheduled_for))}</i>
                <Button
                  style={{ marginTop: 20 }}
                  variant="outlined"
                  fullWidth
                  color="warning"
                  onClick={() => deleteMessageToSend(m.id)}
                >
                  Cancel
                </Button>
              </Card>
            ))}
        </Grid>
      </Grid>
    </div>
  );
}
