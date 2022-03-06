import Head from "next/head";
import BankHome from "../components/BankHome";

export default function Home() {
  return (
    <div>
      <Head>
        <title>Prathvi Bank</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <BankHome />
      </main>
    </div>
  );
}
