import { useState } from "react";
import { Button, TextField, Stack, CircularProgress } from "@mui/material";
import axios from "axios";

const API_URL =
  "https://rg9alncs8g.execute-api.ap-southeast-2.amazonaws.com/prod/upload";

const allowedExtensions = [".mp3"];

type FilePickerProps = {
  isDisabled: boolean;
  onSelect: (file: File) => void;
};

const FilePicker = ({ isDisabled, onSelect }: FilePickerProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = "." + file.name.split(".").pop()?.toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      alert("Only MP3 files are allowed.");
      e.target.value = "";
      return;
    }

    onSelect(file);
    e.target.value = "";
  };

  return (
    <Button
      component="label"
      disabled={isDisabled}
      variant="contained"
      color="secondary"
    >
      Upload MP3
      <input hidden={true} type="file" accept=".mp3" onChange={handleChange} />
    </Button>
  );
};

function App() {
  const buttons = Array.from({ length: 25 }, (_, i) => i + 1);
  const [selectedButton, setSelectedButton] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File>();
  const [soundName, setSoundName] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handlePickFile = (file: File) => {
    console.log("Selected file:", file);
    setSelectedFile(file);
  };

  const resetForm = () => {
    setSelectedButton(null);
    setSelectedFile(undefined);
    setSoundName("");
  };

  const handleUpload = async () => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile!);
      formData.append("label", soundName);
      formData.append("place", selectedButton!.toString());

      await axios.post(API_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert(
        "Upload successful! Your sound will be available at button " +
          selectedButton
      );
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      resetForm();
    }
  };

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "10px",
          padding: "20px",
          maxWidth: "400px",
          margin: "auto",
        }}
      >
        {buttons.map((num) => (
          <Button
            key={num}
            variant="contained"
            onClick={() => setSelectedButton(num)}
            style={{
              backgroundColor: selectedButton === num ? "red" : "",
            }}
          >
            Button {num}
          </Button>
        ))}
      </div>
      <Stack
        direction={"row"}
        spacing={2}
        style={{ textAlign: "left", marginTop: "20px" }}
      >
        <FilePicker
          isDisabled={selectedButton === null}
          onSelect={(file) => {
            handlePickFile(file);
          }}
        />
        <TextField
          variant="outlined"
          value={selectedFile?.name || ""}
          disabled
        />
        <TextField
          label="Sound Name"
          variant="outlined"
          helperText="Example: Ăn Mày Quá Khứ"
          required
          onChange={(e) => setSoundName(e.target.value)}
        />
        <Button
          variant={isUploading ? "outlined" : "contained"}
          color="primary"
          disabled={!selectedFile?.name}
          onClick={handleUpload}
        >
          {isUploading ? (
            <CircularProgress size={20} color="success" />
          ) : (
            "Upload"
          )}
        </Button>
      </Stack>
    </>
  );
}

export default App;
