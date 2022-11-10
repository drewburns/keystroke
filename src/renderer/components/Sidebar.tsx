import { Button, Grid } from '@mui/material';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import React from 'react';
import { formatPhoneNumber } from '../util';
import FolderBar from './FolderBar';
import TopSideBar from './TopSideBar';

type SelectedChatType = {
  chatGuid: string;
  chatName: string;
};

type Props = {
  chatThreads: any[];
  nameNumbers: any;
  selectedChat: SelectedChatType;
  setPage: (page: string) => void;
  setSelectedChat: (obj: any) => void;
  getChatUserHandle: (numberList: string[], displayName: ?string) => string;
};

TimeAgo.addDefaultLocale(en);
export default function Sidebar({
  chatThreads,
  nameNumbers,
  selectedChat,
  setSelectedChat,
  setPage,
  getChatUserHandle,
}: Props) {
  const timeAgo = new TimeAgo('en-US');

  const [showFolders, setShowFolders] = React.useState(false);

  const getTime = (dateString: string) => {
    const then = new Date(dateString);
    return timeAgo.format(then);
  };


  const showMessagePreview = (row: any) => {
    const { attach_list } = row;
    if (attach_list) {
      const returnString = `${attach_list.split(',').length} attachments`;
      // TODO: be more specific here
      return returnString;
    }
    return row['message.text'];

    // attach_list ? `Attachment: ${attach_list.split(",").}`
  };

  const handleSelectChat = (row: any) => {
    setSelectedChat({
      chatGuid: row['chat.guid'],
      chatName: getChatUserHandle(
        row.member_list.split(','),
        row['chat.display_name']
      ),
    });
  };

  return (
    <div className="sidebar-container">
      <Grid container className="sidebar-top">
        <TopSideBar setPage={setPage} />
      </Grid>
      <div
        style={{
          overflow: 'scroll',
          width: '100%',
          float: 'left',
          height: '100vh',
          backgroundColor: '#FAF8FF',
        }}
      >
        {showFolders ? (
          <FolderBar setShowFolders={setShowFolders} />
        ) : (
          <>
            {chatThreads.map((row) => (
              <div
                className={
                  row['chat.guid'] === selectedChat.chatGuid
                    ? 'chatPreviewSelected'
                    : 'chatPreview'
                }
                onClick={() => handleSelectChat(row)}
              >
                <Grid container style={{ height: 20 }}>
                  <div style={{ height: 80, width: 20 }}>
                    {row['message.is_read'] === 0 &&
                      row['message.is_from_me'] === 0 && (
                        <div className="unreadBall" />
                      )}
                  </div>
                  <Grid item xs={7}>
                    <h4 className="sidebarHandle">
                      {getChatUserHandle(
                        row.member_list.split(','),
                        row['chat.display_name']
                      )}
                    </h4>
                  </Grid>
                  <Grid item xs={4}>
                    <p style={{ fontSize: 12 }}>
                      {getTime(row['message.date'])}
                    </p>
                  </Grid>
                </Grid>
                <p className="previewText">{showMessagePreview(row)}</p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
