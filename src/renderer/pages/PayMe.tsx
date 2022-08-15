import { Button, TextField } from '@mui/material';
import React from 'react';

type Props = {
  tryCode: (code: string) => void;
};
export default function PayMe({ tryCode }: Props) {
  const [code, setCode] = React.useState('');
  return (
    <div style={{}}>
      <h1>Loading or you havent paid. Please text 8607346043</h1>
      <h3>Enter your access code:</h3>
      <TextField
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        id="outlined-basic"
        label="code"
        variant="filled"
        placeholder="Access code..."
        style={{ marginTop: 10, backgroundColor: 'white' }}
      />
      <br />
      <Button variant="contained" onClick={() => tryCode(code)}>
        Enter
      </Button>
    </div>
  );
}
