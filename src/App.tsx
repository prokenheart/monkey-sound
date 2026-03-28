import { useState } from "react";
import { Button, TextField, Stack, CircularProgress } from "@mui/material";
import axios from "axios";
import WeightedWheel from "./WeightedWheel";

const API_URL = import.meta.env.VITE_API_URL;
// const API_URL = "http://127.0.0.1:5132/upload";
const data = [
  { option: "primary", weight: 60 },
  { option: "success", weight: 25 },
  { option: "secondary", weight: 10 },
  { option: "danger", weight: 5 },
];

type dataType = {
  option: string;
  weight: number;
};

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
      sx={{ width: "50%" }}
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

  const [mustSpin, setMustSpin] = useState(false);
  const [prizeIndex, setPrizeIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [prizeStyle, setPrizeStyle] = useState<string | null>(null);

  const mapingPrizeToStyle = (option: number) => {
    switch (option) {
      case 0:
        return "primary";
      case 1:
        return "success";
      case 2:
        return "secondary";
      case 3:
        return "danger";
      default:
        return "primary";
    }
  };

  const mappingPrizeToButton = (option: number) => {
    switch (option) {
      case 0:
        return "#5865F2";
      case 1:
        return "#248046";
      case 2:
        return "#4E5058";
      case 3:
        return "#DA373C";
      default:
        return "#5865F2";
    }
  };

  const getWeightedIndex = (data: dataType[]) => {
    const total = data.reduce((sum, item) => sum + item.weight, 0);
    const rand = Math.random() * total;
    console.log("Random number:", rand, "Total weight:", total);
    let cumulative = 0;
    for (let i = 0; i < data.length; i++) {
      cumulative += data[i].weight;
      if (rand < cumulative) return i;
    }
    return 0;
  };

  const handleSpin = () => {
    const index = getWeightedIndex(data); // 👈 quyết định kết quả
    setPrizeIndex(index);
    console.log("Spinning... Prize index:", index);
    setMustSpin(true);
    setIsSpinning(true);
  };

  const handlePickFile = (file: File) => {
    console.log("Selected file:", file);
    setSelectedFile(file);
  };

  const resetForm = () => {
    setSelectedButton(null);
    setSelectedFile(undefined);
    setSoundName("");
    setPrizeIndex(0);
    setPrizeStyle(null);
  };

  const handleUpload = async () => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile!);
      const name =
        soundName != "" && soundName
          ? soundName
          : "Tôi bị ngu vì không đặt tên cho âm thanh này";
      formData.append("label", name);
      formData.append("place", selectedButton!.toString());
      formData.append("style", prizeStyle!);

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
          padding: "10px",
          maxWidth: "1200px",
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
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Button {num}
          </Button>
        ))}
      </div>
      <Stack
        direction={"row"}
        spacing={4}
        justifyContent={"center"}
        alignItems={"center"}
      >
        <Stack
          direction={"column"}
          spacing={2}
          style={{ textAlign: "left", marginTop: "20px" }}
          width={"400px"}
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
            value={soundName}
          />
        </Stack>
        <Stack
          direction={"column"}
          spacing={2}
          style={{ textAlign: "left", marginTop: "20px" }}
          width={"400px"}
        >
          <WeightedWheel
            data={data}
            mustStartSpinning={mustSpin}
            prizeNumber={prizeIndex}
            onStopSpinning={() => {
              setMustSpin(false);
              setIsSpinning(false);
              setPrizeStyle(mapingPrizeToStyle(prizeIndex));
            }}
          />
          <Button
            variant={isSpinning ? "outlined" : "contained"}
            color="primary"
            onClick={handleSpin}
            disabled={isSpinning}
          >
            {isSpinning ? (
              <CircularProgress size={20} color="success" />
            ) : (
              "Gacha Button Color"
            )}
          </Button>
        </Stack>
        <Button
          variant={"contained"}
          sx={{
            minWidth: 120,
            backgroundColor: prizeStyle
              ? mappingPrizeToButton(prizeIndex)
              : "primary",
          }}
          disabled={!selectedFile?.name || isSpinning || !prizeStyle || isUploading}
          onClick={handleUpload}
        >
          {isUploading ? (
            <CircularProgress size={30} color="success" />
          ) : (
            "Upload"
          )}
        </Button>
      </Stack>
    </>
  );
}

export default App;
