/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
import { CircularProgress, Grid } from '@mui/material';
import mixpanel from 'mixpanel-browser';

import TimeAgo from 'javascript-time-ago';
import TextareaAutosize from 'react-textarea-autosize';
// import { ReactTinyLink } from 'react-tiny-link';
import { LinkPreview } from '@dhaiwat10/react-link-preview';

import heic2any from 'heic2any';
import en from 'javascript-time-ago/locale/en';
import React from 'react';
import { isValidHttpUrl } from '../util';

type Props = {
  message: any;
  index: number;
  messagesLength: number;
  getNameForNumber: (number: string) => string;
  isReminderBubble: boolean;
};
// TimeAgo.addDefaultLocale(en);

export default function MesssageBubble({
  message,
  index,
  messagesLength,
  isReminderBubble,
  getNameForNumber,
}: Props) {
  const [bubbleContent, setBubbleContent] = React.useState<any>(<p />);
  const timeAgo = new TimeAgo('en-US');
  const getStatusText = (message: any) => {
    if (message.is_read === 1) {
      return `Read ${timeAgo.format(new Date(message['message.date_read']))}`;
      // return 'Read';
    }
    if (message.is_delivered) {
      return 'Delivered';
    }
  };

  const showFile = (filePath: string) => {
    mixpanel.track('show file double click');
    window.electron.ipcRenderer.sendMessage('showFile', filePath);
  };

  const renderAttachmnet = async (message: any) => {
    mixpanel.track('Render attachment');

    let filenames = [];
    let mimes = [];
    if (message.attach_list && message.mimes) {
      filenames = message.attach_list
        .split(',')
        .map((m: string) => `file:///Users/andrewburns/${m.slice(2)}`);
      mimes = message.mime_list.split(',');
    } else {
      filenames = [`file:///Users/andrewburns/${message.filename.slice(2)}`];
      mimes = [message.mime_type];
    }

    const renderArray = [];

    for (let x = 0; x < filenames.length; x++) {
      const fileName = filenames[x];
      if (!fileName) {
        continue;
      }
      const mime_type = mimes[x];
      if (fileName.includes('.caf')) {
        renderArray.push(
          <div onClick={() => showFile(fileName)}>
            <audio controls>
              <source
                src="file:///Users/andrewburns/Desktop/test_audio.caf"
                type="audio/x-caf; codecs=opus"
              />
            </audio>
            <i>*Click to listen*</i>
          </div>
        );
        continue;
      }

      if (mime_type === 'image/heic') {
        try {
          const res = await fetch(fileName);
          const blob = await res.blob();
          const conversionResult = await heic2any({
            blob,
            toType: 'image/jpeg',
            quality: 0.3,
          });
          const url = URL.createObjectURL(conversionResult);
          renderArray.push(
            <div style={{ maxWidth: isReminderBubble ? 200 : 600 }}>
              <img
                onDoubleClick={() => showFile(fileName)}
                src={url}
                style={{
                  maxHeight: isReminderBubble ? 200 : 450,
                  maxWidth: 600,
                }}
              />
              {message.text && (
                <p style={{ userSelect: 'text' }}>{message.text}</p>
              )}
            </div>
          );
        } catch (err) {
          renderArray.push(
            <i style={{ cursor: 'pointer' }} onClick={() => showFile(fileName)}>
              *Click to view* {message.mime_type}
            </i>
          );
        }
        continue;
      }

      if (
        ['image/jpeg', 'image/gif', 'image/png'].includes(message.mime_type)
      ) {
        renderArray.push(
          <div style={{ maxWidth: isReminderBubble ? 200 : 400 }}>
            <img
              onDoubleClick={() => showFile(fileName)}
              src={fileName}
              style={{ maxHeight: 250, maxWidth: 400 }}
            />
            {message.text && <p>{message.text}</p>}
          </div>
        );
        continue;
      }

      renderArray.push(
        <i style={{ cursor: 'pointer' }} onClick={() => showFile(fileName)}>
          *Click to view*{' '}
          {message.mime_type || message.filename.split('/').slice(-1)[0]}
        </i>
      );
    }
    return renderArray;
  };

  React.useEffect(() => {
    (async () => {
      if (!message) return;
      if (isValidHttpUrl(message.text)) {
        setBubbleContent(
          <div>
            <LinkPreview
              width="300px"
              fallback={<p>{message.text}</p>}
              url={message.text}
            />
          </div>
        );
        return;
      }
      if (message.cache_has_attachments) {
        setBubbleContent(<CircularProgress />);
        const att = await renderAttachmnet(message);
        setBubbleContent(
          <p className={isReminderBubble ? 'reminderChatText' : 'chatText'}>
            {att}
          </p>
        );
      } else {
        setBubbleContent(
          <p className={isReminderBubble ? 'reminderChatText' : 'chatText'}>
            {message.text}
          </p>
        );
      }
    })();
  }, [message]);

  return (
    <Grid container>
      {message.is_from_me === 1 && <Grid item xs={6} md={4} />}
      <Grid item xs={6} md={8}>
        {message['chat.guid'] &&
          message.is_from_me === 0 &&
          message['chat.guid'].includes('chat') && (
            <p className="gc-name-marker">
              {getNameForNumber && getNameForNumber(message['sender.number'])}
            </p>
          )}
        {message['chat.guid']}
        <div
          className={
            message.is_from_me === 1 ? 'chatBubbleMe' : 'chatBubbleOther'
          }
          style={isReminderBubble && { outline: '1px solid #5d5d5d' }}
        >
          {bubbleContent && bubbleContent}
        </div>
        <br />
        {message.is_from_me === 1 && index === 0 && !isReminderBubble && (
          <p
            style={{
              textAlign: 'right',
              fontSize: 12,
              marginRight: 10,
              paddingTop: 8,
            }}
          >
            {getStatusText(message)}
          </p>
        )}
      </Grid>
    </Grid>
  );
}
