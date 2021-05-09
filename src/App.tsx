import React, { useEffect, useState } from "react";
import axios from "axios";
import UploadPage from "./containers/UploadPage";
import UserPage from "./containers/UserPage";
import UserImage from "./containers/UserImage";
import SearchPage from "./containers/SearchPage";
import RegistrationPage from "./containers/RegistrationPage";
import { Router, RouteComponentProps, navigate } from "@reach/router";
import SearchBar from "material-ui-search-bar";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  CircularProgress,
  makeStyles
} from "@material-ui/core";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import AccountCircle from "@material-ui/icons/AccountCircle";
import { config } from "./config";

const apiUrl = config.apiUrl;

const useStyles = makeStyles((theme) => ({
  root: {
    textAlign: "center",
    backgroundColor: "#282c34",
    minHeight: "100vh",
    fontSize: "calc(10px + 2vmin)",
    color: "white"
  },
  toolbar: {
    width: "100%"
  },
  toolbarBox: {
    width: "100%",
    paddingRight: "2rem"
  },
  logo: {
    marginRight: "1rem"
  }
}));

interface PageProps extends RouteComponentProps {
  signedInUser: string;
  setLoading: (isLoading: boolean) => void;
}

interface UserPageProps extends PageProps {
  username?: string;
}

interface UserImageProps extends UserPageProps {
  imageKey?: string;
}

interface SearchPageProps extends UserPageProps {
  searchQuery?: string;
}

const UploadPageRoute = (props: PageProps) =>
  localStorage.getItem("reflection.usertoken") ? (
    <UploadPage
      signedInUser={props.signedInUser}
      setLoading={props.setLoading}
    />
  ) : (
    <RegistrationPage setLoading={props.setLoading} />
  );

const UserPageRoute = (props: UserPageProps) => (
  <UserPage
    signedInUser={props.signedInUser}
    user={props.username}
    setLoading={props.setLoading}
  />
);
const UserImageRoute = (props: UserImageProps) => (
  <UserImage
    signedInUser={props.signedInUser}
    user={props.username}
    imageSuffix={props.imageKey}
    setLoading={props.setLoading}
  />
);

const SearchPageRoute = (props: SearchPageProps) => (
  <SearchPage
    signedInUser={props.signedInUser}
    searchQuery={props.searchQuery}
    setLoading={props.setLoading}
  />
);

const navigateTo = async (route: string) => {
  await navigate(route);
  window.location.reload();
};

const App = () => {
  const [signedInUser, setSignedInUser] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const classes = useStyles();

  useEffect(() => {
    if (!localStorage.getItem("reflection.usertoken")) return;
    axios
      .get(`${apiUrl}/auth`, {
        params: { userToken: localStorage.getItem("reflection.usertoken") },
      })
      .then((val) => {
        console.log(val);
        setSignedInUser(val.data);
      })
      .catch((err) => console.error(err));
  }, [localStorage.getItem("reflection.usertoken")]);

  return (
    <div className={classes.root}>
      <AppBar position="sticky" color="inherit">
        <Toolbar className={classes.toolbar}>
          <Box
            className={classes.toolbarBox}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box display="flex" alignItems="center">
              <Typography className={classes.logo} variant="h5" color="textPrimary">
                Reflection
              </Typography>
              <SearchBar
                value={searchQuery}
                onChange={(newValue) => setSearchQuery(newValue)}
                onCancelSearch={() => setSearchQuery("")}
                onRequestSearch={() => navigateTo(`/search/${searchQuery}`)}
              />
            </Box>
            <Box display="flex" alignItems="center">
              {loading && <CircularProgress color="inherit" />}
              <IconButton onClick={() => navigateTo("/")}>
                <CloudUploadIcon fontSize="large" />
              </IconButton>
              <IconButton onClick={() => navigateTo(`/${signedInUser}`)}>
                <AccountCircle fontSize="large" />
              </IconButton>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      <Router>
        <UploadPageRoute
          path="/"
          signedInUser={signedInUser}
          setLoading={setLoading}
        />
        <SearchPageRoute
          path="search/:searchQuery"
          signedInUser={signedInUser}
          setLoading={setLoading}
        />
        <UserPageRoute
          path=":username"
          signedInUser={signedInUser}
          setLoading={setLoading}
        />
        <UserImageRoute
          path=":username/:imageKey"
          signedInUser={signedInUser}
          setLoading={setLoading}
        />
      </Router>
    </div>
  );
};

export default App;
