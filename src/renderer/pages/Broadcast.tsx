import { Button, Card, Collapse, Grid, Modal, TextField } from '@mui/material';
import { Box } from '@mui/system';
import React from 'react';
import BroadcastListItem from 'renderer/components/BroadcastListItem';
import EditBroadcastList from 'renderer/components/EditBroadcastList';

type Props = {
  nameNumbers: any[];
  isPaid: boolean;
};

export default function Broadcast({ nameNumbers, isPaid }: Props) {
  const [lists, setLists] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [selectedList, setSelectedList] = React.useState(null);
  React.useEffect(() => {
    // mixpan.track('New chat page');

    window.electron.ipcRenderer.on('get-broadcast-lists', (results: any[]) => {
      console.log('results');
      setLists(results);
    });

    window.electron.ipcRenderer.on('create-list', () => {
      window.electron.ipcRenderer.sendMessage('get-broadcast-lists', null);
    });
    window.electron.ipcRenderer.sendMessage('get-broadcast-lists', null);
  }, []);

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '75%',
    maxHeight: '500px',
    maxWidth: '600px',
    alignItems: 'center',
    alignContent: 'center',
    // display: 'flex',
    textAlign: 'center',
    justifyContent: 'center',
    transform: 'translate(-50%, -50%)',
    bgcolor: '#333',
    // border: '1px #d3d3d3 solid',
    boxShadow: 24,
    p: 4,
  };

  React.useEffect(() => {
    // mixpan.track('New chat page');
    if (!selectedList) return;
    setOpen(true);
  }, [selectedList]);

  React.useEffect(() => {
    window.electron.ipcRenderer.sendMessage('get-broadcast-lists', null);
    if (!open) {
      setSelectedList(null);
    }
  }, [open]);

  const [newListName, setNewListName] = React.useState('');

  const createGroup = () => {
    // alert(newListName);
    window.electron.ipcRenderer.sendMessage('create-list', newListName);
    setOpen(false);
    // window.electron.ipcRenderer.sendMessage('create-list', newListName);
    window.electron.ipcRenderer.sendMessage('get-broadcast-lists');
    setSelectedList(null);
  };

  if (!isPaid) {
    return (
      <div style={{ textAlign: 'center', padding: 30 }}>
        <h2>Upgrade to use Broadcast lists!</h2>
        <p>
          With broadcast lists you can create lists and send to many people
          individually without making a groupchat
        </p>
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
            Upgrade Now
          </Button>
        </a>
        <br />
        <br />
        <iframe
          width="560"
          height="315"
          src="https://www.youtube.com/embed/Owz7JcYIriU"
          title="YouTube video player"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        />
        <br />
      </div>
    );
  }

  return (
    <div>
      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setSelectedList(null);
        }}
      >
        {!selectedList ? (
          <div>
            <Box sx={style}>
              <h3>New Broadcast List</h3>
              <p>Bulksend a message to a list - without making a groupchat</p>
              <TextField
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                style={{ backgroundColor: 'white', borderRadius: 5 }}
                label="Name"
                placeholder="New list..."
              />
              <br />
              <Button
                onClick={() => createGroup()}
                style={{
                  marginTop: 10,
                  width: 150,
                  paddingTop: 11,
                  paddingBottom: 11,
                  backgroundColor: '#2D7FFA',
                }}
                variant="contained"
              >
                Create
              </Button>
            </Box>
          </div>
        ) : (
          <EditBroadcastList
            setOpen={setOpen}
            selectedList={selectedList}
            nameNumbers={nameNumbers}
          />
        )}
      </Modal>
      <div
        style={{
          overflow: 'scroll',
          width: '100%',
          float: 'left',
          height: '100vh',
          backgroundColor: '#27282A',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 20,
            width: '100%',
            justifyContent: 'space-between',
            backgroundColor: '#1F1F1F',
          }}
        >
          <h1 style={{ fontSize: 22 }}>Broadcast ⚡️</h1>
          <Button
            variant="contained"
            onClick={() => setOpen(true)}
            style={{
              marginRight: 100,
              backgroundColor: '#CFDFFF',
              color: '#0B302F',
            }}
          >
            New
          </Button>
        </div>
        <Grid container>
          <Grid item xs={1} />
          <Grid item xs={10}>
            {lists.map((broadcast_list) => (
              <BroadcastListItem
                broadcast_list={broadcast_list}
                setSelectedList={setSelectedList}
              />
            ))}
          </Grid>
        </Grid>
      </div>
    </div>
  );
}
