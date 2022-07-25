import { Button, Card, Grid } from '@mui/material';
import React from 'react';
import { EditText, EditTextarea } from 'react-edit-text';
import 'react-edit-text/dist/index.css';
import TimedMessageCard from 'renderer/components/TimedMessageCard';

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
  const updateMessageToSend = (id: number, newText: string) => {
    window.electron.ipcRenderer.sendMessage('edit-message-to-send', [
      id,
      newText,
    ]);
  };

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
              <TimedMessageCard
                deleteMessageToSend={deleteMessageToSend}
                getChatUserHandle={getChatUserHandle}
                message={m}
                updateMessageToSend={updateMessageToSend}
              />
            ))}
        </Grid>
      </Grid>
    </div>
  );
}
