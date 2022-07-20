import React from 'react';
import GroupIcon from '@mui/icons-material/Group';
import WorkIcon from '@mui/icons-material/Work';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import DeleteIcon from '@mui/icons-material/Delete';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { Badge, Grid } from '@mui/material';

type Props = {
  setShowFolders: (boolean) => void;
};
export default function FolderBar({ setShowFolders }: Props) {
  const data = [
    {
      name: 'Friends',
      icon: <GroupIcon fontSize="large" />,
      badge: 8,
    },
    { name: 'Family', icon: <FamilyRestroomIcon fontSize="large" />, badge: 2 },
    {
      name: 'Work',
      icon: <WorkIcon fontSize="large" />,
      badge: 4,
    },
    {
      name: 'Delivery',
      icon: <LocalShippingIcon fontSize="large" />,
      badge: 1,
    },
    {
      name: 'Spam',
      icon: <DeleteIcon fontSize="large" />,
      badge: 1,
    },
    {
      name: 'New',
      icon: <AddCircleOutlineIcon fontSize="large" />,
    },
  ];
  return (
    <Grid container style={{ paddingTop: 20 }}>
      {data.map((row) => (
        <Grid
          xs={6}
          style={{ textAlign: 'center', cursor: 'pointer' }}
          onClick={() => setShowFolders()}
        >
          <Badge badgeContent={row.badge} color="primary">
            {row.icon}
          </Badge>
          <p>{row.name}</p>
        </Grid>
      ))}
    </Grid>
  );
}
