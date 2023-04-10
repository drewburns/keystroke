import { Card, Grid, Collapse, Button } from '@mui/material';
import React from 'react';
import mixpanel from 'mixpanel-browser';
import MessageBar from './MessageBar';
import Dropzone from 'react-dropzone';
import { toast } from 'react-toastify';

type Props = {
  broadcast_list: any;
  setSelectedList: (obj: any) => void;
};

export default function BroadcastListItem({
  broadcast_list,
  setSelectedList,
}: Props) {
  const [isReplying, setIsReplying] = React.useState(false);
  const [files, setFiles] = React.useState([]);
  return (
    <Dropzone
      noClick
      onDrop={(acceptedFiles) => {
        setFiles(files.concat(acceptedFiles));
      }}
    >
      {({ getRootProps, getInputProps }) => (
        <div {...getRootProps()}>
          <Card
            variant="outlined"
            className="reminderCard"
            style={{ backgroundColor: '#fff', color: 'black' }}
          >
            <Grid container>
              <Grid item xs={6}>
                <h3 style={{ paddingLeft: 20, marginBottom: 0 }}>
                  {broadcast_list.name}
                </h3>
                <p style={{ paddingLeft: 20, fontSize: 13 }}>
                  {/*<i>*/}
                  {broadcast_list.part_list
                    ? broadcast_list.part_list.split(',').length
                    : 0}{' '}
                  members 👋
                  {/*</i>*/}
                </p>
                <Button
                  variant="contained"
                  style={{
                    height: 40,
                    marginLeft: 10,
                    marginTop: 0,
                    marginBottom: 15,
                    backgroundColor: 'black',
                    color: 'white',
                    borderRadius: 9,
                  }}
                  onClick={() => setIsReplying(!isReplying)}
                >
                  {isReplying ? 'Cancel' : 'Message'}
                </Button>
              </Grid>
              <Grid
                item
                xs={6}
                style={{
                  marginTop: 15,
                  display: 'flex',
                  justifyContent: 'flex-end',
                  paddingRight: 20,
                }}
              >
                <Button
                  style={{
                    height: 50,
                    color: '#0B302F',
                    marginRight: 10,
                    borderRadius: 9,
                  }}
                  variant="outlined"
                  // color="#D0F7C3"
                  // fullWidth
                  onClick={() => setSelectedList(broadcast_list)}
                >
                  Edit List
                </Button>
              </Grid>
            </Grid>
            <Collapse in={isReplying}>
              <MessageBar
                broadcastIds={[broadcast_list.id]}
                chatGuids={[]}
                files={files}
                setFiles={setFiles}
                isFromNew={false}
                onMessageSent={() => {
                  setIsReplying(false);
                  toast.success('Sent message!');
                  mixpanel.track('Replied to reminder');
                }}
              />
            </Collapse>
          </Card>
        </div>
      )}
    </Dropzone>
  );
}
