import "../styles/globals.css";

require("../styles/antd.less");

import type { AppProps } from "next/app";

// context
import Provider from "../components/context/provider";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider>
      <Component {...pageProps} />
    </Provider>
  );
}

export default MyApp;
