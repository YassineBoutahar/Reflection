import React, { useState } from "react";
import axios from "axios";
import { DropzoneAreaBase, FileObject } from "material-ui-dropzone";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Checkbox,
  FormControlLabel,
  Box,
  makeStyles,
} from "@material-ui/core";
import { DialogProps } from "@material-ui/core/Dialog";
import { config } from "../config";

const apiUrl = config.apiUrl;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "80vh",
    padding: "0 3rem 0 3rem",
  },
  uploadControl: {
    margin: "0 1rem 1rem 1rem",
  },
  editorPreview: {
    objectFit: "contain",
    height: "20%",
    width: "20%",
    cursor: "pointer",
  },
}));

type appProps = {
  signedInUser: string;
  setLoading: (isLoading: boolean) => void;
};

interface userSpecificedMeta {
  description: string;
  hashtags: string;
  private: boolean;
}

interface imageMetadata extends userSpecificedMeta {
  imageType: string;
  filename: string;
  lastModified: number;
  username: string;
}

interface pendingFileObject {
  fileObj: FileObject;
  previewUrl: string;
  metadata: userSpecificedMeta;
}

const UploadPage = ({ signedInUser, setLoading }: appProps) => {
  const [pendingFiles, setPendingFiles] = useState<pendingFileObject[]>([]);
  const [
    currentEditingFile,
    setCurrentEditingFile,
  ] = useState<pendingFileObject>();
  const [uploadingFiles, setUploadingFiles] = useState<boolean>(false);
  const [filePickerOpen, setFilePickerOpen] = useState<boolean>(false);
  const [metaEditorOpen, setMetaEditorOpen] = useState<boolean>(false);
  const [scroll, setScroll] = useState<DialogProps["scroll"]>("paper");

  const classes = useStyles();

  const handleClickOpen = (scrollType: DialogProps["scroll"]) => () => {
    setFilePickerOpen(true);
    setScroll(scrollType);
  };

  const handleClose = () => {
    setFilePickerOpen(false);
  };

  const descriptionElementRef = React.useRef<HTMLElement>(null);
  React.useEffect(() => {
    if (filePickerOpen) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [filePickerOpen]);

  const convertImage = (imageToConvert: File) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(imageToConvert);
      reader.onload = () => resolve(reader.result?.toString());
      reader.onerror = (error) => reject(error);
    });

  const uploadAll = () => {
    setUploadingFiles(true);
    setLoading(true);
    Promise.all(
      pendingFiles.map((pendingFile) =>
        uploadImage(pendingFile.fileObj.file, pendingFile.metadata)
      )
    )
      .then((val) => {
        setUploadingFiles(false);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setUploadingFiles(false);
        setLoading(false);
      });
  };

  const uploadImage = (file: File, meta: userSpecificedMeta) =>
    new Promise(async (resolve, reject) => {
      let metadata: imageMetadata = {
        imageType: file.type,
        filename: file.name,
        lastModified: file.lastModified,
        description: meta.description,
        hashtags: meta.description,
        username: signedInUser,
        private: meta.private,
      };
      console.log(metadata);
      let uploadUrl;
      try {
        let uploadRes = await axios.post(`${apiUrl}/image`, metadata);
        console.log(uploadRes);
        uploadUrl = uploadRes.data;
      } catch (err) {
        console.error(err);
        return;
      }

      let base64Image;
      try {
        base64Image = await convertImage(file);
        axios
          .put(uploadUrl, base64Image)
          .then((val) => {
            console.log(val);
            setPendingFiles((prev) =>
              prev.filter((f) => f.fileObj.file !== file)
            );
            resolve(`Uploaded ${file.name}`);
          })
          .catch((err) => {
            console.error(err);
            reject(`Could not upload ${file.name}`);
          });
      } catch (err) {
        console.error(err);
        reject(`Could not convert ${file.name}`);
      }
    });

  const updateFileMeta = (
    file: pendingFileObject,
    meta: userSpecificedMeta
  ) => {
    let updatedFile: pendingFileObject = { ...file, metadata: meta };
    setPendingFiles((prev) => [
      ...prev.filter((f) => f.fileObj.file !== file.fileObj.file),
      updatedFile,
    ]);
    setCurrentEditingFile(updatedFile);
  };

  return (
    <div className={classes.root}>
      <Box display="flex" justifyContent="center">
        <Button
          className={classes.uploadControl}
          variant="outlined"
          disabled={pendingFiles.length === 0 || uploadingFiles}
          onClick={() => setFilePickerOpen(true)}
        >
          Edit Metadata
        </Button>
        <Button
          className={classes.uploadControl}
          variant="outlined"
          disabled={pendingFiles.length === 0 || uploadingFiles}
          onClick={() => uploadAll()}
        >
          Upload Images
        </Button>
      </Box>
      <DropzoneAreaBase
        fileObjects={pendingFiles.map((f) => f.fileObj)}
        onAdd={(newFiles) => {
          // Prevent duplicate uploads
          newFiles = newFiles.filter(
            (file) => !pendingFiles.find((f) => f.fileObj.data === file.data)
          );
          setPendingFiles((prev) => [
            ...prev,
            ...newFiles.map((nf) => ({
              fileObj: nf,
              previewUrl: URL.createObjectURL(nf.file),
              metadata: { description: "", hashtags: "", private: false },
            })),
          ]);
        }}
        onDelete={(delFile, delIndex) =>
          setPendingFiles((prev) => prev.filter((val, idx) => idx !== delIndex))
        }
        maxFileSize={55000000}
        filesLimit={500}
        acceptedFiles={["image/*"]}
        dropzoneText={"Drag and drop an image here or click"}
        showFileNames
        onAlert={(message, variant) => console.log(`${variant}: ${message}`)}
      />
      <Dialog
        open={filePickerOpen}
        onClose={handleClose}
        scroll={scroll}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        <DialogTitle id="scroll-dialog-title">Metadata Editor</DialogTitle>
        <DialogContent dividers={scroll === "paper"}>
          {pendingFiles.map((f) => (
            <img
              className={classes.editorPreview}
              src={f.previewUrl}
              alt={f.fileObj.file.name}
              onClick={() => {
                setCurrentEditingFile(f);
                setMetaEditorOpen(true);
              }}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={metaEditorOpen} onClose={() => setMetaEditorOpen(false)}>
        <DialogTitle id="scroll-dialog-title">{`Metadata for ${currentEditingFile?.fileObj.file.name}`}</DialogTitle>
        <DialogContent>
          <TextField
            value={currentEditingFile?.metadata.description}
            onChange={(event) =>
              updateFileMeta(currentEditingFile!, {
                ...currentEditingFile!.metadata,
                description: event.target.value,
              })
            }
            label="Description"
            multiline
            rowsMax={5}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={currentEditingFile?.metadata.private}
                onChange={() =>
                  updateFileMeta(currentEditingFile!, {
                    ...currentEditingFile!.metadata,
                    private: !currentEditingFile!.metadata.private,
                  })
                }
                color="primary"
              />
            }
            label="Private"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMetaEditorOpen(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default UploadPage;
