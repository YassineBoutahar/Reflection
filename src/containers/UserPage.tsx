import React, { useEffect, useState } from "react";
import ImageGallery from "../components/ImageGallery";
import axios from "axios";
import { config } from "../config";

const apiUrl = config.apiUrl;

type appProps = {
  user?: string;
  signedInUser: string;
  setLoading: (isLoading: boolean) => void;
};

const UserPage = ({ user, signedInUser, setLoading }: appProps) => {
  const [allImagesKeys, setAllImageKeys] = useState<string[]>([]);
  console.log(user);

  useEffect(() => {
    if(!user) return;
    getUserImages(user);
  }, [user]);

  const getUserImages = (username: string) => {
    axios
      .get(`${apiUrl}/user`, { params: { username } })
      .then((val) => {
        setAllImageKeys((val.data as string[]) || []);
      })
      .catch((err) => console.error(err));
  };

  return (
    <ImageGallery signedInUser={signedInUser} imageKeys={allImagesKeys} setLoading={setLoading} />
  );
};

export default UserPage;
