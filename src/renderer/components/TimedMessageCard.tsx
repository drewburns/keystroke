import { Button, Card, Grid } from '@mui/material';
import React from 'react';
import { EditText, EditTextarea } from 'react-edit-text';
import 'react-edit-text/dist/index.css';

type Props = {
  getChatUserHandle: (list: string[], displayName: string) => string;
  message: any;
  deleteMessageToSend: (id: number) => void;
  updateMessageToSend: (id: number, body: string) => void;
};

export default function TimedMessageCard({
  getChatUserHandle,
  message,
  deleteMessageToSend,
  updateMessageToSend
}: Props) {
  const [body, setBody] = React.useState(message.body);

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

  return (
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
        {message.part_list &&
          getChatUserHandle(
            message.part_list.split(','),
            message['chat.display_name']
          )}
      </p>
      <p>Body:</p>{' '}
      <EditTextarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onSave={() => updateMessageToSend(message.id, body)}
        rows={1}
      />
      <i>Sending in {timeToGo(new Date(message.scheduled_for))}</i>
      <Button
        style={{ marginTop: 20 }}
        variant="outlined"
        fullWidth
        color="warning"
        onClick={() => deleteMessageToSend(message.id)}
      >
        Cancel
      </Button>
    </Card>
  );
}
