import { MenuItem, Select, TextField } from '@mui/material';
import React from 'react';

type Props = {
  timeDenom: number;
  timeAmount: number;
  setTimeAmount: (val: number) => void;
  setTimeDenom: (val: number) => void;
  setFreshTime: () => void;
};

export default function TimePicker({
  timeDenom,
  timeAmount,
  setTimeAmount,
  setTimeDenom,
  setFreshTime,
}: Props) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
      }}
    >
      <TextField
        type="number"
        value={timeAmount}
        onChange={(e) => setTimeAmount(parseInt(e.target.value))}
        style={{ marginTop: 20, backgroundColor: 'white', width: 80 }}
      />
      <Select
        id="demo-simple-select"
        style={{ backgroundColor: 'white', height: 60, marginTop: 19 }}
        value={timeDenom}
        label="Age"
        onChange={(e) => {
          setTimeDenom(e.target.value);
        }}
      >
        <MenuItem value={60}>Minutes</MenuItem>
        <MenuItem value={60 * 60}>Hours</MenuItem>
        <MenuItem value={60 * 60 * 24}>Days</MenuItem>
      </Select>
    </div>
  );
}
