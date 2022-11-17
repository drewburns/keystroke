import React from 'react';
import NotificationsIcon from '@mui/icons-material/Notifications';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import CreateIcon from '@mui/icons-material/Create';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';

type Props = {
  setPage: (page: string) => void;
  page: string | null | undefined;
};
export default function TopSideBar({ setPage, page }: Props) {
  return (
    <div style={{ color: 'black', display: 'flex', cursor: 'pointer' }}>
      {/* <SearchIcon /> */}
      <div onClick={() => setPage('reminders')} className="topBarIcon">
        <h3 style={{ marginBottom: 0, marginTop: 5 }}>⌛️</h3>
        <p style={{ fontSize: 10, margin: 0, fontWeight: 'bold' }}>Reminds</p>
      </div>
      <div onClick={() => setPage('timedMessages')} className="topBarIcon">
        <h3 style={{ marginBottom: 0, marginTop: 5 }}>🌞</h3>
        <p style={{ fontSize: 10, margin: 0, fontWeight: 'bold' }}>Delays</p>
      </div>
      <div onClick={() => setPage('broadcast')} className="topBarIcon">
        <h3 style={{ marginBottom: 0, marginTop: 5 }}>⚡️</h3>
        <p style={{ fontSize: 10, margin: 0, fontWeight: 'bold' }}>Blasts</p>
      </div>
      {/* <div onClick={() => setPage('settings')} className="topBarIcon">
        <h3 style={{ marginBottom: 0, marginTop: 5 }}>📊️</h3>
        <p style={{ fontSize: 10, margin: 0, fontWeight: 'bold' }}>Stats</p>
      </div> */}
      {/* 
      <CreateIcon
          onClick={() => setPage('newChat')}
          style={{ cursor: 'pointer', paddingRight: 2 }}
        />
      <NotificationsIcon
        onClick={() => setPage('reminders')}
        style={{ cursor: 'pointer', paddingRight: 2 }}
      />
      <AccessTimeIcon
        onClick={() => setPage('timedMessages')}
        style={{ cursor: 'pointer', paddingRight: 2 }}
      />
      <PeopleIcon
        onClick={() => setPage('broadcast')}
        style={{ cursor: 'pointer', paddingRight: 2 }}
      />
      <SettingsIcon
        onClick={() => setPage('settings')}
        style={{ cursor: 'pointer', paddingRight: 2 }}
      /> */}
      {/* <EmojiPeopleIcon
        onClick={() => setPage('timedMessages')}
        style={{ cursor: 'pointer' }}
      /> */}
    </div>
  );
}
