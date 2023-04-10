/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
import {
  Button,
  FormControlLabel,
  Grid,
  Popover,
  TextField,
  Checkbox,
  Typography,
} from '@mui/material';
import TextareaAutosize from 'react-textarea-autosize';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import FilePresentIcon from '@mui/icons-material/FilePresent';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import mixpanel from 'mixpanel-browser';
import { copyBlobToClipboard } from 'copy-image-clipboard';

import React from 'react';
import { truncate, uploadToS3 } from '../util';

import TimePicker from './TimePicker';

type Props = {
  chatGuids: string[];
  files: any[];
  broadcastIds: number[];
  isFromNew: boolean;
  setFiles?: (newFiles: any[]) => void;
  onMessageSent?: () => void;
  chatNames: string[];
  messageId: string | null;
};

export default function MessageBar({
  chatGuids,
  files,
  setFiles,
  isFromNew,
  broadcastIds,
  messageId,
  onMessageSent,
  chatNames,
}: Props) {
  // console.log(chatGuids);
  const [messageBody, setMessageBody] = React.useState('');
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const [timeAmount, setTimeAmount] = React.useState(0);
  const [timeDenom, setTimeDenom] = React.useState(60 * 60);
  const [cancelIfReply, setCancelIfReply] = React.useState(true);

  const [date, setDate] = React.useState<Date | null>(null);

  // const handleDatePick = (newValue: Date | null) => {
  //   setDate(newValue);
  // };

  React.useEffect(() => {
    if (timeAmount === 0) {
      setDate(null);
      return;
    }
    const t = new Date();
    t.setSeconds(t.getSeconds() + timeAmount * timeDenom);
    setDate(t);
  }, [timeDenom, timeAmount]);

  const allowedFileTypes = [
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/gif',
    'image/tiff',
  ];
  const onKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    let finalMessageBody = messageBody;
    if (e.keyCode === 13 && !e.shiftKey) {
      e.preventDefault();
      mixpanel.track('on send message keystroke', {
        numUsers: chatGuids.length,
      });
      // const blobs = []
      // for (const x in files) {
      //   const file = files[x];
      //   console.log(file);
      //   const blob = new Blob([file], { type: file.type });
      //   // copyBlobToClipboard(blob)
      //   //   const obj = {}
      //   //   obj[file.type] = blob
      //   //   navigator.clipboard.write([
      //   //     new ClipboardItem(obj)
      //   // ]);
      //   // if (file.type === 'image/heic') {
      //   //   alert('HEIC image type not accepted yet');
      //   //   return;
      //   // }
      //   // if (allowedFileTypes.includes(file.type)) {
      //   //   const uploadedImage = await uploadToS3({
      //   //     image: file,
      //   //     fileType: file.type,
      //   //   });
      //   //   finalMessageBody += ` ${uploadedImage}`;
      //   // }
      // }
      if (!finalMessageBody) return;
      setTimeAmount(0);
      mixpanel.track('broadcast sent');
      if (broadcastIds) {
        broadcastIds.forEach((id: number) => {
          window.electron.ipcRenderer.sendMessage('send-to-broadcast-id', [
            id,
            chatGuids,
            finalMessageBody,
            date,
            cancelIfReply,
          ]);
        });
      }
      chatGuids.forEach((chatGuid: string, index: number) => {
        const firstName = chatNames ? chatNames[index].split(' ')[0] : '';
        const parsedBody = chatNames
          ? finalMessageBody.replace('{first_name}', firstName)
          : finalMessageBody;
        mixpanel.track('sent message', { isDate: !!date });
        window.electron.ipcRenderer.sendMessage('send-message', [
          chatGuid,
          parsedBody,
          false,
          messageId,
          date,
          cancelIfReply,
        ]);
      });
      setMessageBody('');
      if (onMessageSent) onMessageSent();
      setFiles && setFiles([]);
    }
    // TODO: assume for now that this will always work
  };

  const textInput = React.useRef(null);

  React.useEffect(() => {
    // setTimeAmount(0);
    // console.log(chatGuids)
    if (!isFromNew) {
      textInput.current.focus();
    }
  }, [chatGuids]);

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
          style={{
            marginTop: 25,
            paddingLeft: 15,
            cursor: 'pointer',
            paddingBottom: 0,
          }}
        >
          <div>
            <AccessAlarmIcon
              onClick={handleClick}
              style={date && { color: '#1A8BFF' }}
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
              <div style={{ padding: 10, backgroundColor: 'black' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={cancelIfReply}
                      onChange={() => setCancelIfReply(!cancelIfReply)}
                      sx={{
                        color: '#1A8BFF',
                        paddingBottom: 0,
                        '&.Mui-checked': {
                          color: '#1A8BFF',
                        },
                      }}
                    />
                  }
                  style={{ color: 'white' }}
                  label="Cancel if they reply first"
                />

                <TimePicker
                  timeDenom={timeDenom}
                  timeAmount={timeAmount}
                  setTimeAmount={setTimeAmount}
                  setTimeDenom={setTimeDenom}
                />
                {date ? (
                  <Button fullWidth onClick={() => setDate(null)}>
                    Remove
                  </Button>
                ) : (
                  <Button
                    fullWidth
                    onClick={() => {
                      const t = new Date();
                      t.setSeconds(t.getSeconds() + timeAmount * timeDenom);
                      setDate(t);
                      setAnchorEl(null);
                    }}
                  >
                    Select
                  </Button>
                )}
              </div>
            </Popover>
          </div>
        </Grid>
        <Grid item xs={10} style={{ marginTop: 20, marginBottom: 10 }}>
          <Grid container>
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
          </Grid>
          <div>
            <TextareaAutosize
              maxRows={3}
              ref={textInput}
              autoFocus
              onChange={(e) => setMessageBody(e.target.value)}
              value={messageBody}
              spellCheck
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
