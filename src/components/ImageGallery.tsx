import React, { useEffect, useState } from "react";
import axios from "axios";
import { navigate } from "@reach/router";
import Gallery from "react-photo-gallery";
import Carousel, { Modal, ModalGateway } from "react-images";
import { IconButton, makeStyles } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import { config } from "../config";

const apiUrl = config.apiUrl;

const useStyles = makeStyles((theme) => ({
    root: {
      width: "100vw"
    },
    gallery: {
      width: "100%"
    },
    customHeader: {
      position: "absolute",
      top: 0,
      left: 50,
      zIndex: 1000
    }
  }));

type appProps = {
  imageKeys: string[];
  signedInUser: string;
  setLoading: (isLoading: boolean) => void;
};

type retrievedMetadata = {
  filename: string;
  hashtags: string;
  username: string;
  description: string;
  uploader: string;
  imageId: string;
};

type galleryImage = {
  src: string;
  height: number;
  width: number;
  metadata: retrievedMetadata;
};

const ImageGallery = ({ imageKeys, signedInUser, setLoading }: appProps) => {
  const [allImages, setAllImages] = useState<galleryImage[]>([]);
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  const classes = useStyles();

  useEffect(() => {
    getAllImages(imageKeys);
  }, [imageKeys]);

  const getAllImages = (imageUrls: string[]) => {
    setLoading(true);
    Promise.all(imageUrls.map((imgKey) => getSingleImage(imgKey)))
      .then((val: any) => setLoading(false))
      .catch((err: string) => {
          console.error(err);
          setLoading(false);
        });
  };

  const getSingleImage = (imageKey: string) =>
    new Promise((resolve, reject) => {
      axios
        .get(`${apiUrl}/image`, {
          params: { imageKey: imageKey, username: signedInUser },
        })
        .then((val) => {
          let presignedS3Url = val.data.presignedUrl;
          let metadata = val.data.metadata;
          axios
            .get(presignedS3Url)
            .then((lval) => {
              console.log(lval);
              let tempImg = new Image();
              tempImg.onload = () => {
                setAllImages((prev) => [
                  ...prev,
                  {
                    src: lval.data,
                    height: tempImg.height,
                    width: tempImg.width,
                    metadata: metadata,
                  },
                ]);
                resolve(`${metadata.filename} loaded`);
              };
              tempImg.src = lval.data;
            })
            .catch((eee) => {
              console.error(eee);
              reject(eee);
            });
          console.log(val.data);
        })
        .catch((err) => {
          console.error(err);
          err.response.status === 403 ? resolve(err) : reject(err);
        });
    });

  const deleteImage = (imageIndex: number) => {
    axios
      .post(`${apiUrl}/delete`, {
        username: signedInUser,
        imageId: allImages[imageIndex].metadata.imageId,
      })
      .then((deleteResponse) => {
        setLightboxOpen(false);
        setAllImages((prev) =>
          prev.filter((_img, idx) => idx !== imageIndex)
        );
        console.log(deleteResponse);
      })
      .catch((err) => console.error(err));
  };

  const CustomHeader = () => (
    <div className={classes.customHeader}>
      <IconButton
        onClick={() => deleteImage(currentImageIndex)}
        disabled={
          allImages[currentImageIndex].metadata.username !== signedInUser
        }
      >
        <DeleteIcon fontSize="large" />
      </IconButton>
      <IconButton
        onClick={() =>
          navigate(
            `/${allImages[currentImageIndex].metadata.uploader}/${allImages[currentImageIndex].metadata.imageId}`
          )
        }
      >
        <OpenInNewIcon fontSize="large" />
      </IconButton>
    </div>
  );

  return (
    <div className={classes.root}>
        {allImages.length > 0 ? (
          <div className={classes.gallery}>
            <Gallery
              photos={allImages.map((imgObj, idx) => ({
                ...imgObj,
                key: idx.toString(),
              }))}
              onClick={(_event, { photo, index }) => {
                setCurrentImageIndex(index);
                setLightboxOpen(true);
              }}
            />
            <ModalGateway>
              {lightboxOpen ? (
                <Modal
                  onClose={() => {
                    setCurrentImageIndex(0);
                    setLightboxOpen(false);
                  }}
                >
                  <Carousel
                    currentIndex={currentImageIndex}
                    views={allImages.map((img) => ({
                      ...img,
                      source: img.src,
                      caption: `${img.metadata.uploader} - ${
                        img.metadata.filename
                      } ${img.metadata.description ? "-" : ""} ${
                        img.metadata.description
                      }`,
                    }))}
                    components={{ Header: CustomHeader }}
                  />
                </Modal>
              ) : null}
            </ModalGateway>
          </div>
        ) : (
          `No images found`
        )}
      </div>
  );
};

export default ImageGallery;
