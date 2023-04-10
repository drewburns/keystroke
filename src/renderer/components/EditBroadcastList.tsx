import {
  Box,
  Grid,
  Select,
  TextField,
  Autocomplete,
  Button,
} from '@mui/material';
import { formatPhoneNumber } from '../util';
import React from 'react';

type Props = {
  selectedList: any;
  nameNumbers: any[];
  setOpen: (val: boolean) => void;
};
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: '75%',
  maxHeight: '600px',
  maxWidth: '1000px',
  alignItems: 'center',
  alignContent: 'center',
  // display: 'flex',
  textAlign: 'center',
  justifyContent: 'center',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'white',
  // border: '1px #d3d3d3 solid',
  boxShadow: 24,
  p: 4,
};
export default function EditBroadcastList({
  selectedList,
  nameNumbers,
  setOpen,
}: Props) {
  React.useEffect(() => {
    window.electron.ipcRenderer.once(
      'get-chat-participants',
      (results: any[]) => {
        const data = results
          .filter((r) => r.part_list && r.part_list.split(',').length === 1)
          .map((r) => ({
            label:
              r.display_name ||
              r.part_list
                .split(',')
                .map(
                  (num: string) =>
                    `${nameNumbers[num.replace(/^\+[0-9]/, '')] || num} ${
                      r.guid.includes('SMS') ? '(SMS)' : ''
                    }`
                )
                .join(' & '),
            value: r.guid || r.broadcast_list_id || r.part_list,
          }));
        const newOptions = data.sort((a, b) => a.label.length - b.label.length);
        setSelectOptions(newOptions);
      }
    );
    window.electron.ipcRenderer.sendMessage('get-chat-participants', null);
  }, [selectedList]);

  const [searchValue, setSearchValue] = React.useState('');
  const [listMembers, setListMembers] = React.useState(
    selectedList.part_list ? selectedList.part_list.split(',') : []
  );
  console.log(listMembers);
  const addUserToList = (name: string, guid: string) => {
    // setValue(newValue);
    const newMems = [...listMembers];
    newMems.unshift(guid);
    setListMembers(newMems);
    window.electron.ipcRenderer.sendMessage('add-to-broadcast-list', [
      selectedList.id,
      guid,
    ]);
  };

  const removeItem = (guid: string) => {
    const newMems = [...listMembers];
    setListMembers(newMems.filter((r) => r !== guid));
    window.electron.ipcRenderer.sendMessage('remove-from-broadcast-list', [
      selectedList.id,
      guid,
    ]);
  };

  const [selectOptions, setSelectOptions] = React.useState([]);
  const [selectedItem, setSelectedItem] = React.useState('');
  return (
    <Box sx={style}>
      <div>
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'flex-start',
          }}
        >
          <h3>{selectedList.name}</h3>
        </div>
        <Grid container>
          <Grid
            item
            xs={4}
            style={{ overflow: 'scroll', width: '100%', maxHeight: 350 }}
          >
            {listMembers.map((part) => (
              // <Grid item xs={}>
              <p style={{ marginRight: 15, textAlign: 'left' }}>
                {nameNumbers[formatPhoneNumber(part)] || part.split(';')[2]}{' '}
                <span
                  onClick={() => removeItem(part)}
                  style={{
                    color: 'red',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  X
                </span>
              </p>
              // </Grid>
            ))}
          </Grid>
          <Grid item xs={8}>
            <div>
              <TextField
                label="Search..."
                value={searchValue}
                fullWidth
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>
            <div style={{ height: 400, overflow: 'scroll', marginTop: 10 }}>
              {selectOptions
                .filter((x) =>
                  x.label.toLowerCase().includes(searchValue.toLowerCase())
                )
                .map((option) => (
                  <>
                    {!listMembers.includes(option.value) && (
                      <Grid
                        container
                        style={{ borderBottom: '1px solid #d3d3d3' }}
                      >
                        <Grid item xs={8}>
                          <p style={{ textAlign: 'left' }}>{option.label}</p>
                        </Grid>
                        <Grid item xs={4}>
                          <Button
                            onClick={() =>
                              addUserToList(option.label, option.value)
                            }
                            style={{ marginTop: 4 }}
                          >
                            Add
                          </Button>
                        </Grid>
                      </Grid>
                    )}
                  </>
                ))}
            </div>
          </Grid>
        </Grid>
      </div>
      <Button
        style={{
          position: 'absolute',
          right: 15,
          top: 15,
          backgroundColor: 'black',
          color: 'white',
        }}
        onClick={() => {
          setOpen(false);
          window.electron.ipcRenderer.sendMessage(
            'delete-list',
            selectedList.id
          );
        }}
        variant="contained"
        // color="warning"
      >
        Delete List
      </Button>
    </Box>
  );
}
