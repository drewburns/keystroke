import { Button, TextField } from '@mui/material';
import React from 'react';

type Props = {
  tryCode: (code: string) => void;
};
export default function PayMe({ tryCode }: Props) {
  const [code, setCode] = React.useState('');
  return (
    <div style={{}}>
      <h1>Hey there! Thanks for downloading Keystroke!</h1>
      <h3>Need an access code?</h3>
      <a
        style={{
          color: 'white',
          fontWeight: 'bold',
          textDecoration: 'underline',
        }}
        target="_blank"
        href="https://buy.stripe.com/8wMdR0bLF9VW9SE289"
        rel="noreferrer"
      >
        Click here to purchase a code (30 free trial, cancel anytime!)
      </a>
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
      <p>
        <i>For assistance please text 8607346043</i>
      </p>
    </div>
  );
}
