/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import ImageGallery from "../components/ImageGallery";
import axios from "axios";
import { config } from "../config";

const apiUrl = config.apiUrl;

type searchProps = {
  searchQuery?: string;
  signedInUser: string;
  setLoading: (isLoading: boolean) => void;
};

const SearchPage = ({ searchQuery, signedInUser, setLoading }: searchProps) => {
  const [matchingImageKeys, setMatchingImageKeys] = useState<string[]>([]);

  useEffect(() => {
    setMatchingImageKeys([]);
    getMatchingImages(searchQuery || "");
  }, [searchQuery]);

  const getMatchingImages = (query: string) => {
    axios
      .get(`${apiUrl}/search`, {
        params: { searchQuery: query, username: signedInUser },
      })
      .then((val) => {
        console.log(val.data);
        setMatchingImageKeys(val.data || [])
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <ImageGallery signedInUser={signedInUser} imageKeys={matchingImageKeys} setLoading={setLoading} />
  );
};

export default SearchPage;
