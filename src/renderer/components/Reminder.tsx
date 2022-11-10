import { Button, Card, Grid, Collapse } from '@mui/material';
import React from 'react';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import mixpanel from 'mixpanel-browser';

import { getTimeAgo } from '../util';
import MesssageBubble from './MesssageBubble';
import { formatPhoneNumber } from '../util';
import { useGlobalState } from 'renderer/util/GlobalContext';
import MessageBar from './MessageBar';

type Props = {
  getChatUserHandle: (numberList: string[], displayName: string) => void;
  dismissReminder: (reminder_id: number) => void;
  goToChat: (chatGuid: string) => void;
  reminder: any;
};

export default function Reminder({
  getChatUserHandle,
  reminder,
  dismissReminder,
  goToChat,
}: Props) {
  const { state } = useGlobalState();
  const [isReplying, setIsReplying] = React.useState(false);
  const getNameForNumber = (number: string) => {
    return state.nameNumbers![formatPhoneNumber(number)] || number;
  };

  return (
    <Card
      variant="outlined"
      className="reminderCard"
      style={{ backgroundColor: '#fff', color: 'black', padding: 20 }}
    >
      <Grid container>
        <Grid
          item
          xs={12}
          style={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            borderRadius: 10,
            // justifyContent: 'space-between',
          }}
          onDoubleClick={() => goToChat(reminder['chat.guid'])}
        >
          <p
            style={{
              marginTop: 0,
              fontSize: 20,
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              fontWeight: 'bold',
            }}
          >
            {reminder.member_list &&
              getChatUserHandle(
                reminder.member_list.split(','),
                reminder.display_name
              )}
          </p>
        </Grid>
        <p style={{ marginTop: 0, fontSize: 12, padding: 0 }}>
          {getTimeAgo(reminder['message.date'])}
        </p>
        <Grid
          item
          xs={12}
          style={{ cursor: 'pointer' }}
          onDoubleClick={() => goToChat(reminder['chat.guid'])}
        >
          <p style={{ marginTop: 9 }}>{reminder.text}</p>
          {/* <MesssageBubble
            isReminderBubble
            message={reminder}
            index={1}
            getNameForNumber={getNameForNumber}
          /> */}
          {reminder.note && (
            <p>
              <i>Note: {reminder.note}</i>
            </p>
          )}
        </Grid>
        <Grid container style={{ marginTop: 10, paddingLeft: 10 }}>
          <Grid item xs={4} style={{ paddingRight: 10 }}>
            <Button
              variant="outlined"
              style={{ backgroundColor: 'black', color: 'white' }}
              fullWidth
              onClick={() => setIsReplying(!isReplying)}
            >
              {isReplying ? 'Cancel' : 'Respond'}
            </Button>
          </Grid>
          <Grid item xs={4}>
            <Button
              variant="outlined"
              fullWidth
              style={{ backgroundColor: '#9EA2FF', color: 'white' }}
              // color="warning"
              onClick={() => dismissReminder(reminder['reminder.id'])}
            >
              Snooze
            </Button>
          </Grid>
        </Grid>
      </Grid>
      <Collapse in={isReplying}>
        {/* <Grid item xs={12}> */}
        <MessageBar
          messageId={reminder['reminder.message_id']}
          chatGuids={[reminder['chat.guid']]}
          chatName
          files={[]}
          isFromNew={false}
          onMessageSent={() => {
            dismissReminder(reminder['reminder.id']);
            mixpanel.track('Replied to reminder');
          }}
        />
        {/* </Grid> */}
      </Collapse>
    </Card>
  );
}
