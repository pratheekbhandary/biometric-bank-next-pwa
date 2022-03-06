import React from "react";
import { useQRCode } from "next-qrcode";
import { v4 as uuidv4 } from "uuid";
import { CircularProgress } from "@mui/material";

function App() {
  const { Canvas } = useQRCode();
  const [uuid, setUuid] = React.useState("");

  React.useEffect(() => {
    // register a uuid on load and setState
    const id = setInterval(() => {
      setUuid(uuidv4());
    }, 2000);
    return () => {
      clearInterval(id);
    };
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      {uuid ? (
        <Canvas
          text={uuid}
          options={{
            type: "image/jpeg",
            quality: 0.3,
            level: "M",
            margin: 3,
            scale: 4,
            width: 500,
            color: {
              dark: "#010599FF",
              light: "#FFBF60FF",
            },
          }}
        />
      ) : (
        <CircularProgress color="secondary" />
      )}
    </div>
  );
}

export default App;
