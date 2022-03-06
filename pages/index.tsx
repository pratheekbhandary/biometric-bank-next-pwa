import { GetStaticProps } from "next";
import Link from "next/link";

import { User } from "../interfaces";
import { sampleUserData } from "../utils/sample-data";
import Layout from "../components/Layout";
import List from "../components/List";
import { useState } from "react";

type Props = {
  items: User[];
};

const apiUrl = "/api";

const bufferToBase64 = (buffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buffer)));
const base64ToBuffer = (base64) =>
  Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

const WithStaticProps = () => {
  const [loader, setLoader] = useState(false);
  const [msg, setMsg] = useState("");
  const removeCredential = () => {
    localStorage.removeItem("credential");
  };

  const clearMessage = () => {
    setTimeout(() => setMsg(""), 2000);
  };

  const register = async () => {
    setLoader(true);

    try {
      const credentialCreationOptions = await (
        await fetch(`${apiUrl}/registration-options`, {
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        })
      ).json();

      credentialCreationOptions.challenge = new Uint8Array(
        credentialCreationOptions.challenge.data
      );
      credentialCreationOptions.user.id = new Uint8Array(
        credentialCreationOptions.user.id.data
      );
      credentialCreationOptions.user.name = "pwa@example.com";
      credentialCreationOptions.user.displayName = "What PWA Can Do Today";

      const credential = await navigator.credentials.create({
        publicKey: credentialCreationOptions,
      });

      //@ts-ignore
      const credentialId = bufferToBase64(credential.rawId);

      localStorage.setItem("credential", JSON.stringify({ credentialId }));

      const data = {
        rawId: credentialId,
        response: {
          attestationObject: bufferToBase64(
            //@ts-ignore
            credential.response.attestationObject
          ),
          //@ts-ignore
          clientDataJSON: bufferToBase64(credential.response.clientDataJSON),
          id: credential.id,
          type: credential.type,
        },
      };

      await (
        await fetch(`${apiUrl}/register`, {
          method: "POST",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ credential: data }),
          credentials: "include",
        })
      ).json();

      console.log("Registration successful!");
      setMsg("Registration successful!");
      clearMessage();
    } catch (e) {
      console.error("registration failed", e);
    } finally {
    }
  };

  const authenticate = async () => {
    try {
      const credentialRequestOptions = await (
        await fetch(`${apiUrl}/authentication-options`, {
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        })
      ).json();

      const { credentialId } = JSON.parse(localStorage.getItem("credential"));

      credentialRequestOptions.challenge = new Uint8Array(
        credentialRequestOptions.challenge.data
      );
      credentialRequestOptions.allowCredentials = [
        {
          id: base64ToBuffer(credentialId),
          type: "public-key",
          transports: ["internal"],
        },
      ];

      const credential = await navigator.credentials.get({
        publicKey: credentialRequestOptions,
      });

      const data = {
        //@ts-ignore
        rawId: bufferToBase64(credential.rawId),
        response: {
          authenticatorData: bufferToBase64(
            //@ts-ignore
            credential.response.authenticatorData
          ),
          //@ts-ignore
          signature: bufferToBase64(credential.response.signature),
          //@ts-ignore
          userHandle: bufferToBase64(credential.response.userHandle),
          //@ts-ignore
          clientDataJSON: bufferToBase64(credential.response.clientDataJSON),
          id: credential.id,
          type: credential.type,
        },
      };

      const response = await fetch(`${apiUrl}/authenticate`, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ credential: data }),
        credentials: "include",
      });

      if (response.status === 404) {
        console.log("Credential has expired, please register a new credential");
        setMsg("Credential has expired, please register a new credential");
        clearMessage();
        removeCredential();
      } else {
        const assertionResponse = await response.json();
        setMsg("Authentication successful!");
        clearMessage();
        console.log("Authentication successful!");
      }
    } catch (e) {
      console.error("authentication failed", e);
    } finally {
    }
  };

  return (
    <Layout title="Prathvi Bank">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "2rem",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <button style={{ margin: "2rem", padding: "2rem" }} onClick={register}>
          Register
        </button>
        <button
          style={{ margin: "2rem", padding: "2rem" }}
          onClick={authenticate}
        >
          Authenticate
        </button>
        <button
          style={{ margin: "2rem", padding: "2rem" }}
          onClick={removeCredential}
        >
          Delete
        </button>
      </div>
      {msg && <h1 style={{ marginBottom: "400px" }}>{msg}</h1>}
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  return { props: {} };
};

export default WithStaticProps;
