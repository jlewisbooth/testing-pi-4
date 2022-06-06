import React, {
  useState,
  useEffect,
  useCallback,
  useReducer,
  useRef,
} from "react";
import DispatcherContext from "./dispatcher";
import { notification } from "antd";
import WebsocketConnection from "../../src/util/ws-connection";

const openNotificationWithIcon = ({
  type,
  message,
  description,
}: {
  type: "error" | "warning" | "success";
  message: string | number;
  description: string;
}) => {
  notification[type]({
    message,
    description: `${description} - Resoures`,
    placement: "topRight",
    top: 30,
    duration: 3,
  });
};

function parseQuery(queryString: string) {
  var query: { [key: string]: string } = {};
  var pairs = (
    queryString[0] === "?" ? queryString.substr(1) : queryString
  ).split("&");
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i].split("=");
    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || "");
  }
  return query;
}

const DashboardProvider: React.FC<React.PropsWithChildren<{}>> = (props) => {
  const [client, setClient] = useState<any>(null);

  useEffect(() => {
    setClient(
      new WebsocketConnection({
        host: "modeluk.local",
        path: "data-stream/client",
        secure: false,
        debug: true,
        verbose: true,
      })
    );
  }, []);

  useEffect(() => {
    if (client) {
      let queryParameters = parseQuery(window.location.search);

      console.log("QUERY", queryParameters);

      client.on("connected", () => {
        console.log("CLIENT CONNECTED AND READY");

        client.listenToLocation("ub.model-uk.tower-bridge");
      });
    }
  }, [client]);

  return (
    <DispatcherContext.Provider
      value={{
        client: client,
      }}
    >
      {props.children}
    </DispatcherContext.Provider>
  );
};

export default DashboardProvider;
