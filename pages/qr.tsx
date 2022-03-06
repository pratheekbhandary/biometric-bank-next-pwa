import React, { useState } from "react";
import dynamic from "next/dynamic";

const QrReader = dynamic(
  () => import("react-qr-reader").then((mod) => mod.QrReader),
  {
    ssr: false,
  }
);

const QR = () => {
  const [result, setResult] = useState("No result");

  return (
    <div>
      <QrReader
        constraints={{}}
        scanDelay={300}
        onResult={(result, error) => {
          if (!!result) {
            setResult(result.getText());
          }

          if (!!error) {
            console.info(error);
          }
        }}
        containerStyle={{ width: "100%" }}
      />
      <p>{result}</p>
    </div>
  );
};

export default QR;
