import { Button, Grid, Popover, TextField, Typography } from '@mui/material';
import TextareaAutosize from 'react-textarea-autosize';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import FilePresentIcon from '@mui/icons-material/FilePresent';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

import React from 'react';

type Props = {
  chatGuids: string[];
  files: any[];
  isFromNew: boolean;
  setFiles?: (newFiles: any[]) => void;
  onMessageSent?: () => void;
  messageId: string | null;
};

export default function MessageBar({
  chatGuids,
  files,
  setFiles,
  isFromNew,
  messageId,
  onMessageSent,
}: Props) {
  // console.log(chatGuids);
  const [messageBody, setMessageBody] = React.useState('');
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const [date, setDate] = React.useState<Date | null>(null);

  const handleDatePick = (newValue: Date | null) => {
    setDate(newValue);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.keyCode === 13 && !e.shiftKey) {
      e.preventDefault();
      chatGuids.forEach((chatGuid: string) => {
        console.log('sending to chatGuid', chatGuid);
        if (messageBody) {
          window.electron.ipcRenderer.sendMessage('send-message', [
            chatGuid,
            messageBody,
            false,
            messageId,
            date
          ]);
        }
        files.forEach((file) => {
          // console.log(file);
          window.electron.ipcRenderer.sendMessage('send-message', [
            chatGuid,
            file.path,
            true,
            null,
          ]);
        });
      });
      setMessageBody('');
      if (onMessageSent) onMessageSent();
      setFiles && setFiles([]);
    }
    // TODO: assume for now that this will always work
  };

  const textInput = React.useRef(null);

  React.useEffect(() => {
    if (!isFromNew) {
      textInput.current.focus();
    }
  }, [chatGuids]);

  const truncate = (fullStr: string, strLen: number) => {
    if (fullStr.length <= strLen) return fullStr;

    const separator = '...';

    const sepLen = separator.length;
    const charsToShow = strLen - sepLen;
    const frontChars = Math.ceil(charsToShow / 2);
    const backChars = Math.floor(charsToShow / 2);

    return (
      fullStr.substr(0, frontChars) +
      separator +
      fullStr.substr(fullStr.length - backChars)
    );
  };

  const generateFilePreview = (file: any) => {
    if (file.type.includes('image')) {
      return (
        <img
          src={`file://${file.path}`}
          style={{ height: 70, width: 70, paddingLeft: 10, paddingRight: 10 }}
        />
      );
    }

    return (
      <div className="filePreviewCard">
        <FilePresentIcon />
        {truncate(file.name, 15)}
      </div>
    );
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const removeFile = (filePath: string): void => {
    const newFiles = files.filter((f) => f.path !== filePath);
    setFiles(newFiles);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Grid container>
        <Grid
          item
          xs={1}
          style={{ marginTop: 25, paddingLeft: 15, cursor: 'pointer' }}
        >
          <div>
            <AccessAlarmIcon
              onClick={handleClick}
              style={date && { color: '#1A8BFF'}}
            />
            <Popover
              id={id}
              open={open}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
            >
              <div style={{ padding: 10 }}>
                <DateTimePicker
                  label="Send at"
                  value={date}
                  onChange={handleDatePick}
                  renderInput={(params) => <TextField {...params} />}
                />
                {date && <Button onClick={() => setDate(null)}>Clear</Button>}
              </div>
            </Popover>
          </div>
        </Grid>
        <Grid item xs={10} style={{ marginTop: 20, marginBottom: 10 }}>
          {/* <Grid container>
          {files.map((f) => (
            <div>
              <div>
                <span
                  className="cancelUploadButton"
                  onClick={() => removeFile(f.path)}
                >
                  X
                </span>
                {generateFilePreview(f)}
              </div>
            </div>
          ))}
        </Grid> */}
          <div>
            <TextareaAutosize
              maxRows={3}
              ref={textInput}
              autoFocus
              onChange={(e) => setMessageBody(e.target.value)}
              value={messageBody}
              minRows={1}
              placeholder="Message"
              onKeyDown={onKeyDown}
              className="messageInputBox"
            />
          </div>
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
}
