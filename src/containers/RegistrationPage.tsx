import React, { useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  makeStyles,
} from "@material-ui/core";
import { navigate } from "@reach/router";
import { config } from "../config";

const apiUrl = config.apiUrl;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "80vh",
  },
  card: {
    width: "40%",
  },
}));

type registrationProps = {
  setLoading: (isLoading: boolean) => void;
};

const RegistrationPage = ({ setLoading }: registrationProps) => {
  const [username, setUsername] = useState<string>("");
  const [inputError, setInputError] = useState<boolean>(false);
  const [returiningInputError, setReturningInputError] = useState<boolean>(
    false
  );
  const [accountToken, setAccountToken] = useState<string>("");
  const [returningToken, setReturningToken] = useState<string>("");
  const [fetchingToken, setFetchingToken] = useState<boolean>(false);
  const [validatingToken, setValidatingToken] = useState<boolean>(false);
  const [tokenDialogOpen, setTokenDialogOpen] = useState<boolean>(false);
  const [returningDialogOpen, setReturningDialogOpen] = useState<boolean>(
    false
  );

  const classes = useStyles();

  const createUser = () => {
    setFetchingToken(true);
    setLoading(true);
    axios
      .post(`${apiUrl}/auth`, { username })
      .then((val) => {
        setAccountToken(val.data);
        setTokenDialogOpen(true);
        setFetchingToken(false);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setInputError(true);
        setFetchingToken(false);
        setLoading(false);
      });
  };

  return (
    <div className={classes.root}>
      <Card className={classes.card}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            Welcome to Reflection
          </Typography>
          <Typography color="textSecondary" variant="h6" component="h2">
            Since this is your first time, you get to pick a username!
          </Typography>
          <TextField
            fullWidth
            value={username}
            onChange={(event) => {
              setUsername(event.target.value);
              if (
                event.target.value.match(/[$-/:-?{-~!"^_`\[\]]/) || 
                event.target.value.match(/\s/)
              ) {
                setInputError(true);
              } else {
                setInputError(false);
              }
            }}
            helperText="Must be unique and contain no symbols"
            placeholder="Username"
            error={inputError}
          />
        </CardContent>
        <CardActions>
          <Button
            size="small"
            onClick={() => setReturningDialogOpen(true)}
            children={
              <Typography variant="subtitle2">Have an account?</Typography>
            }
          ></Button>
          <Button
            disabled={
              tokenDialogOpen ||
              fetchingToken ||
              username.length === 0 ||
              inputError
            }
            size="medium"
            onClick={() => createUser()}
          >
            Submit
          </Button>
        </CardActions>
      </Card>
      <Dialog
        open={tokenDialogOpen}
        onClose={() => {}}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        <DialogTitle id="scroll-dialog-title">Your Token</DialogTitle>
        <DialogContent>
          <Typography>{accountToken}</Typography>
          <Typography>
            You can use this token to login to other browsers.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              localStorage.setItem("reflection.usertoken", accountToken);
              navigate("/");
            }}
            color="inherit"
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={returningDialogOpen}
        onClose={() => setReturningDialogOpen(false)}
      >
        <DialogTitle id="scroll-dialog-title">Enter your token</DialogTitle>
        <DialogContent>
          <TextField
            disabled={validatingToken}
            error={returiningInputError}
            helperText="User must exist"
            placeholder="dc518a7e-dbae-4bb7-b303-85dc087ce78a"
            value={returningToken}
            onChange={(event) => {
              setReturningToken(event.target.value);
              setReturningInputError(false);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            disabled={validatingToken || returningToken.length === 0}
            onClick={() => {
              setValidatingToken(true);
              setLoading(true);
              axios
                .get(`${apiUrl}/auth`, {
                  params: { userToken: returningToken },
                })
                .then(async () => {
                  localStorage.setItem("reflection.usertoken", returningToken);
                  await navigate("/");
                  window.location.reload();
                })
                .catch((err) => {
                  console.error(err);
                  setReturningInputError(true);
                  setValidatingToken(false);
                  setLoading(false);
                });
            }}
            color="inherit"
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default RegistrationPage;
