/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { makeStyles } from "@material-ui/core";
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
}));

type appProps = {
  user?: string;
  imageSuffix?: string;
  signedInUser: string;
  setLoading: (isLoading: boolean) => void;
};

const UserImage = ({
  user,
  imageSuffix,
  signedInUser,
  setLoading,
}: appProps) => {
  const [singleImage, setSingleImage] = useState<string | null>(null);

  const classes = useStyles();

  useEffect(() => {
    setLoading(true);
    getSingleImage(user || "", imageSuffix || "");
  }, []);

  const getSingleImage = (usrName: string, imgSuffix: string) => {
    axios
      .get(`${apiUrl}/image`, {
        params: { imageKey: `${usrName}/${imgSuffix}`, username: signedInUser },
      })
      .then((val) => {
        let presignedS3Url = val.data.presignedUrl;
        axios
          .get(presignedS3Url)
          .then((lval) => {
            console.log(lval);
            setSingleImage(lval.data);
            setLoading(false);
          })
          .catch((eee) => {
            console.error(eee);
            setSingleImage(
              "https://erickson.edu/sites/default/files/404%20Error_0.png"
            );
            setLoading(false);
          });
        console.log(val.data);
      })
      .catch((err) => {
        console.error(err);
        setSingleImage(
          "https://erickson.edu/sites/default/files/404%20Error_0.png"
        );
        setLoading(false);
      });
  };

  return (
    <div className={classes.root}>
      {singleImage ? <img src={singleImage} alt="pic" /> : "Image not found"}
    </div>
  );
};

export default UserImage;
