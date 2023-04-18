import { Button, Grid, TextField } from '@mui/material';
import React from 'react';
import PulseDot from 'react-pulse-dot';
import 'react-pulse-dot/dist/index.css';

type Props = {
  tryCode: (code: string) => void;
};
export default function PayMe({ tryCode }: Props) {
  const [code, setCode] = React.useState('');
  const [showBuy, setShowBuy] = React.useState(false);
  // React.useEffect(() => {
  //   const intervalID = setTimeout(() => {
  //     if (!code) return;
  //     console.log('trying code!', code);
  //     tryCode(code);
  //   }, 3000);

  //   // return () => clearInterval(intervalID);
  // }, [showBuy]);
  return (
    <center>
      <div style={{ justifyContent: 'center', paddingTop: 20 }}>
        <h1>
          Hey there! Thanks for downloading Keystroke!
        </h1>
        <h3 style={{ color: 'black' }}>Whats your email?</h3>
        <TextField
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          id="outlined-basic"
          label="Email"
          variant="filled"
          placeholder="john@gmail.com"
          style={{ marginTop: 10, backgroundColor: 'white', width: 300 }}
        />
        <br></br>
        <br></br>

        {/* <a
        style={{
          color: 'black',
          fontWeight: 'bold',
          textDecoration: 'underline',
        }}
        target="_blank"
        href="https://buy.stripe.com/8wMdR0bLF9VW9SE289"
        rel="noreferrer"
      >
        Click here to purchase a code (7 free trial, cancel anytime!)
      </a> */}

        {showBuy ? (
          <>
            <i>Make sure to use the same email as above on checkout</i>
            <br></br>

            <stripe-buy-button
              buy-button-id="buy_btn_1Mwrf6DTwY6KhyOTof3tz3kQ"
              publishable-key="pk_live_51LPIZ5DTwY6KhyOTHQWCx25pTIOdHdMTKdX9nXK93IRnmlkHDpqzREXqWMhWnpNWJjfuWdzpMwbPmK4Kgp4grIdy00NNFk0iSt"
            ></stripe-buy-button>
            <Grid container>
              <p>Checking subscription status</p>
              <PulseDot style={{ marginTop: 10 }} />
            </Grid>
          </>
        ) : (
          <Button
            style={{ width: 200 }}
            variant="contained"
            onClick={() => {
              setShowBuy(true);
              tryCode(code);
              setInterval(() => {
                console.log('trying...');
                if (!code) return;
                console.log('trying code!', code);
                tryCode(code);
              }, 3000);
            }}
          >
            Next
          </Button>
        )}

        {/* <h3>Enter your access code:</h3>
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
      </Button> */}
        {/* <hr></hr> */}
        <p>
          <i>For assistance please text 8607346043</i>
        </p>
      </div>
    </center>
  );
}
