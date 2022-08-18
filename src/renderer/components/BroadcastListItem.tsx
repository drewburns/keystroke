import { Card, Grid, Collapse, Button } from '@mui/material';
import React from 'react';
import mixpanel from 'mixpanel-browser';
import MessageBar from './MessageBar';

type Props = {
  broadcast_list: any;
  setSelectedList: (obj: any) => void;
};

export default function BroadcastListItem({
  broadcast_list,
  setSelectedList,
}: Props) {
  const [isReplying, setIsReplying] = React.useState(false);
  return (
    <Card
      variant="outlined"
      className="reminderCard"
      style={{ backgroundColor: '#373737', color: 'white' }}
    >
      <Grid container>
        <Grid item xs={6}>
          <h3 style={{ paddingLeft: 10 }}>{broadcast_list.name}</h3>
          <p style={{ paddingLeft: 10 }}>
            <i>
              {broadcast_list.part_list
                ? broadcast_list.part_list.split(',').length
                : 0}{' '}
              people
            </i>
          </p>
        </Grid>
        <Grid item xs={3} style={{ marginTop: 15, paddingRight: 15 }}>
          <Button
            style={{ height: 50 }}
            variant="contained"
            color="warning"
            fullWidth
            onClick={() => setSelectedList(broadcast_list)}
          >
            Edit
          </Button>
        </Grid>
        <Grid item xs={3} style={{ marginTop: 15 }}>
          <Button
            variant="contained"
            style={{ height: 50 }}
            onClick={() => setIsReplying(!isReplying)}
          >
            {isReplying ? 'Cancel' : 'Send Message'}
          </Button>
        </Grid>
      </Grid>
      <Collapse in={isReplying}>
        <MessageBar
          broadcastIds={[broadcast_list.id]}
          chatGuids={[]}
          files={[]}
          isFromNew={false}
          onMessageSent={() => {
            setIsReplying(false);
            mixpanel.track('Replied to reminder');
          }}
        />
      </Collapse>
    </Card>
  );
}
