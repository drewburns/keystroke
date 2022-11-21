/* eslint-disable react/jsx-props-no-spreading */
import {
  Autocomplete,
  Checkbox,
  Chip,
  FormControlLabel,
  Grid,
  TextField,
} from '@mui/material';
import Dropzone from 'react-dropzone';
import Select from 'react-select';
import mixpanel from 'mixpanel-browser';

import React, { Fragment } from 'react';
import MessageBar from './MessageBar';

// TODO: abstract out
type SelectedChatType = {
  chatGuid: string;
  chatName: string;
};

const customStyles = {
  option: (provided, state) => ({
    ...provided,
    color: 'black',
    // borderBottom: '1px dotted pink',
    // color: state.isSelected ? 'red' : 'blue',
    // padding: 20,
  }),
};
type Props = {
  nameNumbers: Record<string, string>;
  setSelectedChat: (newChat: SelectedChatType) => void;
  setPage: (newPage: string) => void;
  refreshList: () => void;
};
export default function NewChat({
  setPage,
  setSelectedChat,
  nameNumbers,
  refreshList,
}: Props) {
  const [selectedTargets, setSelectedTargets] = React.useState<any>([]);
  const [selectOptions, setSelectOptions] = React.useState([]);
  const [lastKeyCode, setLastKeyCode] = React.useState(0);
  const [files, setFiles] = React.useState([]);
  const [createAsBroadcastList, setCreateAsBroadcastList] =
    React.useState(false);

  const [broadcastListName, setBroadcastListName] = React.useState('');

  // React.useEffect(() => {
  // }, [selectedTargets]);

  React.useEffect(() => {
    mixpanel.track('New chat page');

    window.electron.ipcRenderer.once(
      'get-chat-participants',
      (results: any[]) => {
        // console.log('chat parts', results);
        // console.log('name nums', nameNumbers);
        // console.log('chat part ', results);
        const data = results
          .filter((r) => r.part_list)
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
        console.log('data', data);
        setSelectOptions(data.sort((a, b) => a.label.length - b.label.length));
      }
    );
    window.electron.ipcRenderer.sendMessage('get-chat-participants', null);
  }, []);

  React.useEffect(() => {
    // console.log(lastKeyCode);
    if (lastKeyCode === 9 && selectedTargets.length === 1) {
      // TODO: only allow this for a single guid and not multiple
      // or enforce that only multi select can be a mass send
      mixpanel.track('Tab go to chat');
      setPage('chat');
      setSelectedChat({
        chatGuid: selectedTargets[0].value,
        chatName: selectedTargets[0].label,
      });
    }
  }, [lastKeyCode]);

  const createBroadcastList = () => {
    refreshList();
    if (!createAsBroadcastList) {
      return;
    }
    const guidsToAdd = selectedTargets.map((v) => v.value).join(',');
    window.electron.ipcRenderer.sendMessage('create-broadcast-list', [
      broadcastListName,
      guidsToAdd,
    ]);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // 13 === return and we should let them pick another
    // 9 === tab and we should bring them to chat
    setLastKeyCode(e.keyCode);
    // if (e.keyCode === 9 && value[0]) {
    //   setSelectedChat({ chatGuid: value[0].value, chatName: value[0].label });
    // }
  };

  const showMessageBar = () => {
    // selectedTargets.filter((s) => s.label.includes('[Broadcast')).length > 0 ||
    if (selectedTargets.length > 0) {
      return true;
    }
    return (
      selectedTargets.filter((s) => s.label.includes('[Broadcast')).length > 0
    );
  };
  // console.log('name nums', nameNumbers);
  return (
    <div>
      <h1 style={{ marginLeft: 20, paddingBottom: 5, fontSize: 22 }}>
        New Delayed Text
      </h1>

      <Dropzone
        noClick
        onDrop={(acceptedFiles) => {
          setFiles(files.concat(acceptedFiles));
        }}
      >
        {({ getRootProps, getInputProps }) => (
          <div {...getRootProps()}>
            <Grid container>
              <Grid item xs={2} />
              <Grid item xs={8}>
                <Select
                  isMulti
                  autoFocus
                  styles={customStyles}
                  onChange={(newValues) => setSelectedTargets(newValues)}
                  options={selectOptions}
                  onKeyDown={onKeyDown}
                  filterOption={(o, v: string) =>
                    !v
                      .toLowerCase()
                      .split(' ')
                      .map(
                        (sub) =>
                          o.label.toLowerCase().indexOf(sub.toLowerCase()) > -1
                      )
                      .includes(false)
                  }
                  isSearchable
                />
              </Grid>

              <Grid item xs={2} />
              <Grid item xs={2} />
              <Grid item xs={8}>
                {showMessageBar() && (
                  <div>
                    {/* <h3>Mass send massage:</h3> */}
                    <MessageBar
                      isFromNew
                      chatGuids={[
                        ...new Set(
                          selectedTargets
                            .filter((v) => !v.label.includes('[Broadcast'))
                            .map((v: any) => v.value.split(','))
                            .flat()
                        ),
                      ]} // TODO: type this
                      broadcastIds={selectedTargets
                        .filter((v) => v.label.includes('[Broadcast'))
                        .map((v: any) => v.value)}
                      chatNames={selectedTargets.map((v: any) => v.label)} // TODO: type this
                      files={files}
                      onMessageSent={createBroadcastList}
                      setFiles={setFiles} // TODO: remove
                    />
                    {/* {selectedTargets.filter((s) => s.label.includes('[Broadcast'))
              .length === 0 && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={createAsBroadcastList}
                    onChange={() =>
                      setCreateAsBroadcastList(!createAsBroadcastList)
                    }
                    sx={{
                      color: '#1A8BFF',
                      '&.Mui-checked': {
                        color: '#1A8BFF',
                      },
                    }}
                  />
                }
                style={{ color: 'white' }}
                label="Create this as a broadcast list on send"
              />
            )} */}
                    <br />
                    {/* {createAsBroadcastList && (
              <TextField
                type="text"
                label="Broadcast List Name"
                placeholder="My list"
                value={broadcastListName}
                onChange={(e) => setBroadcastListName(e.target.value)}
                style={{ backgroundColor: 'white' }}
              />
            )} */}
                  </div>
                )}
              </Grid>
            </Grid>
          </div>
        )}
      </Dropzone>
    </div>
  );
}

/* most general cases in order:
  1. jump to Luke and send him a message (tab) v1
  2. send a message to Kevin, Rob, and Nick (no groupchat name but existing chat) v1
  3. send a mass message to people v1
  4. create a new groupchat v2
  5. text a new person v2
*/
