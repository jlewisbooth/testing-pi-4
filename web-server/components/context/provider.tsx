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
import { ControlsDispatcher } from "../../src/util/controls-dispatcher";

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
  const [controlsDispatcher] = useState(new ControlsDispatcher());

  useEffect(() => {
    let connection = new WebsocketConnection({
      host: "modeluk.local",
      path: "data-stream/client",
      secure: false,
      debug: true,
      verbose: true,
    });

    setClient(connection);

    return () => {
      connection.close();
    };
  }, []);

  useEffect(() => {
    if (client) {
      let queryParameters = parseQuery(window.location.search);

      client.on("connected", () => {
        client.listenToLocation("ub.model-uk.tower-bridge");
        client.listenToLocation("ub.model-uk.leeds");
        client.listenToLocation("ub.model-uk.glasgow-station");
      });

      client.on("packet", (msg: { [key: string]: any }) => {
        let locationId = msg.locationId;

        if (!!locationId && !!msg.type) {
          controlsDispatcher.dispatchEvent({
            type: locationId + "=>" + msg.type,
            packet: msg,
          });
        }
      });
    }
  }, [client]);

  return (
    <DispatcherContext.Provider
      value={{
        client,
        controlsDispatcher,
      }}
    >
      {props.children}
    </DispatcherContext.Provider>
  );
};

export default DashboardProvider;
