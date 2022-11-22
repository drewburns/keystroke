import { Button, Card, Grid } from '@mui/material';
import React from 'react';
import { EditText, EditTextarea } from 'react-edit-text';
import 'react-edit-text/dist/index.css';
import NewChat from 'renderer/components/NewChat';
import TimedMessageCard from 'renderer/components/TimedMessageCard';

type Props = {
  getChatUserHandle: (list: string[], displayName: string) => string;
  nameNumbers: any;
};

export default function TimedMessageFeed({
  getChatUserHandle,
  nameNumbers,
}: Props) {
  const [messages, setMessages] = React.useState([]);
  React.useEffect(() => {
    window.electron.ipcRenderer.on(
      'get-message-to-send-feed',
      (results: any) => {
        console.log(results);
        setMessages(results);
      }
    );
    window.electron.ipcRenderer.sendMessage('get-message-to-send-feed');
  }, []);

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

  return (
    <div>
      <NewChat
        refreshList={async () => {
          console.log('refresh??');
          await new Promise((r) => setTimeout(r, 1000));
          window.electron.ipcRenderer.sendMessage('get-message-to-send-feed');
        }}
        nameNumbers={nameNumbers}
      />
      <hr />
      <h1 style={{ marginLeft: 20, height: '4vh', fontSize: 22 }}>
        Timed Message Feed
      </h1>
      <div
        style={{
          width: '100%',
          float: 'left',
          height: '89vh',
          backgroundColor: '#FAF8FF',

        }}
      >
        {!messages ? (
          <h4 style={{ paddingLeft: 20 }}>None!</h4>
        ) : (
          <Grid container style={{overflow: 'scroll', height: '50vh', paddingBottom: '10vh'}}>
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
        )}
      </div>
    </div>
  );
}
