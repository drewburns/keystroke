import { CircularProgress, Grid } from '@mui/material';
import React from 'react';
import mixpanel from 'mixpanel-browser';
import InfiniteScroll from 'react-infinite-scroll-component';
import Dropzone from 'react-dropzone';
// TODO: abstract this out
import MessageBar from './MessageBar';
import { formatPhoneNumber } from '../util';
import MesssageBubble from './MesssageBubble';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { useGlobalState } from '../util/GlobalContext';

type Props = {
  chatGuid: string;
  chatName: string;
  setMessageForRemindCreate: (m: any) => void;
  messageForRemindCreate: any;
};

export default function ChatPage({
  chatGuid,
  chatName,
  setMessageForRemindCreate,
  messageForRemindCreate,
}: Props) {
  console.log(chatGuid);
  const { state, setState } = useGlobalState();
  const [messages, setMessages] = React.useState<any[]>([]);
  const [hasMore, setHasMore] = React.useState(true);
  const [files, setFiles] = React.useState<any>([]);
  const [isMuted, setIsMuted] = React.useState(false);

  function unique(array: any[], propertyName: string) {
    return array.filter(
      (e, i) =>
        array.findIndex((a) => a[propertyName] === e[propertyName]) === i
    );
  }

  React.useEffect(() => {
    mixpanel.track('Message page loaded');
    // setMessages([]);
    window.electron.ipcRenderer.once('get-messages', (results: any[]) => {
      console.log('RESULTS', results);
      setMessages(unique(results, 'message.ROWID'));
      window.electron.ipcRenderer.sendMessage('set-chat-read', [chatGuid]);
    });
    window.electron.ipcRenderer.once('get-is-muted', (result: boolean) => {
      console.log('muted', result);
      setIsMuted(result);
    });
    setFiles([]);

    window.electron.ipcRenderer.sendMessage('get-messages', [chatGuid]);
    window.electron.ipcRenderer.sendMessage('get-is-muted', chatGuid);
  }, [chatGuid]);

  React.useEffect(() => {
    window.electron.ipcRenderer.once('new-message', (results: any) => {
      if (results.isLoadMore) {
        // setMessages(results.data.concat(messages));
        setMessages(unique(messages.concat(results.data), 'message.ROWID'));
        return;
      }
      const newMessages = [...messages];
      results.data.forEach((message) => {
        if (message['chat.guid'] === chatGuid) {
          newMessages.unshift(message);
        }
      });
      setMessages(unique(newMessages, 'message.ROWID'));
      window.electron.ipcRenderer.sendMessage('set-chat-read', [chatGuid]);
    });
  }, [messages]);

  const getNameForNumber = (number: string) => {
    return state.nameNumbers![formatPhoneNumber(number)] || number;
  };

  const getMore = () => {
    mixpanel.track('Fetch more messages');
    const lastRowID = messages[messages.length - 1]['message.ROWID'];
    if (!lastRowID) {
      setHasMore(false);
      return;
    }
    window.electron.ipcRenderer.sendMessage('fetch-more', [
      chatGuid,
      lastRowID,
    ]);
  };

  const openReminderCreate = (message: any) => {
    mixpanel.track('Open create reminder modal');

    setMessageForRemindCreate(message);
  };

  // if (!chatGuid) {
  //   return <h1>Welcome</h1>;
  // }
  return (
    <div>
      <div style={{ marginTop: 0, paddingLeft: 10 }}>
        <div>
          <h5
            style={{ display: 'inline-block', marginTop: 12, marginBottom: 12 }}
          >
            To: {chatName}
          </h5>
          {!isMuted ? (
            <NotificationsOffIcon
              style={{ float: 'right', marginTop: 5, cursor: 'pointer' }}
              onClick={() => {
                window.electron.ipcRenderer.sendMessage('toggle-mute', [
                  chatGuid,
                  !isMuted,
                ]);
                setIsMuted(!isMuted);
              }}
            />
          ) : (
            <NotificationsActiveIcon
              style={{ float: 'right', marginTop: 17, cursor: 'pointer' }}
              onClick={() => {
                window.electron.ipcRenderer.sendMessage('toggle-mute', [
                  chatGuid,
                  !isMuted,
                ]);
                setIsMuted(!isMuted);
              }}
            />
          )}
        </div>
        <div
          style={{ backgroundColor: 'black', height: '1px', width: '100%' }}
        />
      </div>
      <Dropzone
        noClick
        onDrop={(acceptedFiles) => {
          setFiles(files.concat(acceptedFiles));
        }}
      >
        {({ getRootProps, getInputProps }) => (
          <div {...getRootProps()}>
            <div
              id="scrollableDiv"
              style={{
                height: files.length === 0 ? '80vh' : '70vh',
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column-reverse',
              }}
            >
              <InfiniteScroll
                dataLength={messages.length}
                next={getMore}
                style={{ display: 'flex', flexDirection: 'column-reverse', paddingBottom: 20 }}
                inverse
                hasMore={hasMore}
                loader={<CircularProgress />}
                scrollableTarget="scrollableDiv"
              >
                {messages.map((m, index) => (
                  <div onDoubleClick={() => openReminderCreate(m)}>
                    <MesssageBubble
                      getNameForNumber={getNameForNumber}
                      message={m}
                      index={index}
                      messagesLength={messages.length}
                    />
                  </div>
                ))}
              </InfiniteScroll>
            </div>
          </div>
        )}
      </Dropzone>
      <div style={{ marginTop: -20 }}>
        {!messageForRemindCreate['message.ROWID'] && (
          <MessageBar
            chatGuids={[chatGuid]}
            isFromNew={false}
            chatNames={[chatName]}
            files={files}
            setFiles={setFiles}
          />
        )}
      </div>
    </div>
  );
}
