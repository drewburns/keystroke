import React from 'react';
import NotificationsIcon from '@mui/icons-material/Notifications';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import CreateIcon from '@mui/icons-material/Create';
import SearchIcon from '@mui/icons-material/Search';

type Props = {
  setPage: (page: string) => void;
};
export default function TopSideBar({ setPage }: Props) {
  return (
    <div>
      {/* <SearchIcon /> */}
      <NotificationsIcon
        onClick={() => setPage('reminders')}
        style={{ cursor: 'pointer' }}
      />
      {/* <GroupAddIcon /> */}
      <CreateIcon
        onClick={() => setPage('newChat')}
        style={{ cursor: 'pointer' }}
      />
    </div>
  );
}
