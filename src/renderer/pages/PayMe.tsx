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
        href="https://checkout.stripe.com/c/pay/cs_live_b1kSHCw4UZne2hHhlK87u0UZF240lMbyfB61nlxMtpR3KWq92FAs6JKaS0#fidkdWxOYHwnPyd1blppbHNgWjA0SVVMXzBBUXJcM05tfEpRTVRSRn03MHVRTEphTWFIUU5hXTxrXU48NkxXa2hpbk1BdXR%2FV0BddFJIbVJrdUtST29jcFJhf3VIcmdVaE4xTmJ1MWJ3TGF8NTVLS0NuNWxWcScpJ3VpbGtuQH11anZgYUxhJz8nPXJIYVc1Z0lDPFNSPFZANz08J3gl"
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
