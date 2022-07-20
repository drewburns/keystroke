/* eslint-disable react/jsx-props-no-spreading */
import { Autocomplete, Chip, Grid, TextField } from '@mui/material';
import Select from 'react-select';
import React from 'react';
import MessageBar from './MessageBar';

//TODO: abstract out
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
};
export default function NewChat({
  setPage,
  setSelectedChat,
  nameNumbers,
}: Props) {
  const [value, setValue] = React.useState<any>([]);
  const [selectOptions, setSelectOptions] = React.useState([]);
  const [lastKeyCode, setLastKeyCode] = React.useState(0);

  React.useEffect(() => {
    window.electron.ipcRenderer.once(
      'get-chat-participants',
      (results: any[]) => {
        const data = results.map((r) => ({
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
          value: r.guid,
        }));
        // console.log(data);
        setSelectOptions(data.sort((a, b) => a.label.length - b.label.length));
      }
    );
    window.electron.ipcRenderer.sendMessage('get-chat-participants', null);
  }, []);

  React.useEffect(() => {
    // console.log(lastKeyCode);
    if (lastKeyCode === 9 && value.length === 1) {
      // TODO: only allow this for a single guid and not multiple
      // or enforce that only multi select can be a mass send
      setPage('chat');
      setSelectedChat({ chatGuid: value[0].value, chatName: value[0].label });
    }
  }, [lastKeyCode]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // 13 === return and we should let them pick another
    // 9 === tab and we should bring them to chat
    setLastKeyCode(e.keyCode);
    // if (e.keyCode === 9 && value[0]) {
    //   setSelectedChat({ chatGuid: value[0].value, chatName: value[0].label });
    // }
  };
  // console.log('name nums', nameNumbers);
  return (
    <Grid container>
      <Grid item xs={2} />
      <Grid item xs={8}>
        <Select
          isMulti
          autoFocus
          styles={customStyles}
          onChange={(newValues) => setValue(newValues)}
          options={selectOptions}
          onKeyDown={onKeyDown}
          // options={Object.entries(nameNumbers).map((val) => ({
          //   value: val[0],
          //   label: val[1],
          // }))}
        />
      </Grid>

      <Grid item xs={2} />
      <Grid item xs={2} />
      <Grid item xs={8}>
        {value.length > 1 && (
          <div>
            <h3>Mass send massage:</h3>
            <MessageBar
              isFromNew
              chatGuids={value.map((v: any) => v.value)} // TODO: type this
              files={[]}
              setFiles={() => console.log('null')} // TODO: remove
            />
          </div>
        )}
      </Grid>
    </Grid>
  );
}

/* most general cases in order:
  1. jump to Luke and send him a message (tab) v1
  2. send a message to Kevin, Rob, and Nick (no groupchat name but existing chat) v1
  3. send a mass message to people v1
  4. create a new groupchat v2
  5. text a new person v2
*/
