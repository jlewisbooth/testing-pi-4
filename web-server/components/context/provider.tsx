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

type Location = {
  title: string;
  locationId: string;
  bgImage?: string;
  isTrainStop?: boolean;
  hideDetails?: boolean;
};

const LOCATIONS: Location[] = [
  {
    title: "Room UK",
    locationId: "ub.model-uk.uk-map",
    hideDetails: true,
  },
  {
    title: "Tower Bridge",
    locationId: "ub.model-uk.tower-bridge",
    bgImage: "/img/tower-bridge.png",
    isTrainStop: true,
  },
  {
    title: "Raglan Castle",
    locationId: "ub.model-uk.raglan-castle",
    bgImage: "/img/raglan-castle.png",
  },
  {
    title: "Leeds",
    locationId: "ub.model-uk.leeds",
    bgImage: "/img/leeds.png",
    isTrainStop: true,
  },
  {
    title: "Glasgow Station",
    locationId: "ub.model-uk.glasgow-station",
    bgImage: "/img/glasgow-station.png",
    isTrainStop: true,
  },
  {
    title: "St James Centre",
    locationId: "ub.model-uk.st-james",
    bgImage: "/img/st-james.png",
  },
];

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

  // locations
  const [locations] = useState(LOCATIONS);
  const [selectedLocation, setSelectedLocation] = useState<Location>({
    title: "Model UK",
    locationId: "ub.model-uk.uk-map",
    hideDetails: true,
  });

  useEffect(() => {
    let connection = new WebsocketConnection({
      host: "modeluk.local", // "modeluk.local"
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
      client.on("connected", () => {
        client.listenToLocation("ub.model-uk.tower-bridge");
        client.listenToLocation("ub.model-uk.raglan-castle");
        client.listenToLocation("ub.model-uk.leeds");
        client.listenToLocation("ub.model-uk.glasgow-station");
        client.listenToLocation("ub.model-uk.st-james");
        client.listenToLocation("ub.model-uk.controller");
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

      let controllerLocationId = "ub.model-uk.controller";
      let selectType = "select";

      controlsDispatcher.addEventListener(
        controllerLocationId + "=>" + selectType,
        ({ packet }: { packet: any }) => {
          if (
            packet.locationId === controllerLocationId &&
            packet.type === selectType
          ) {
            let data = packet.data,
              l;

            switch (data.locationId) {
              case "ub.model-uk.tower-bridge":
                controlsDispatcher.dispatchEvent({
                  type: "change-location",
                  locationId: "ub.model-uk.tower-bridge",
                });

                l = LOCATIONS.find(
                  (l) => l.locationId === "ub.model-uk.tower-bridge"
                );
                if (l) {
                  setSelectedLocation(l);
                }
                break;
              case "ub.model-uk.uk-map":
                controlsDispatcher.dispatchEvent({
                  type: "change-location",
                  locationId: "ub.model-uk.uk-map",
                });

                l = LOCATIONS.find(
                  (l) => l.locationId === "ub.model-uk.uk-map"
                );
                if (l) {
                  setSelectedLocation(l);
                }
                break;
              case "ub.model-uk.raglan-castle":
                controlsDispatcher.dispatchEvent({
                  type: "change-location",
                  locationId: "ub.model-uk.raglan-castle",
                });

                l = LOCATIONS.find(
                  (l) => l.locationId === "ub.model-uk.raglan-castle"
                );
                if (l) {
                  setSelectedLocation(l);
                }
                break;
              case "ub.model-uk.leeds":
                controlsDispatcher.dispatchEvent({
                  type: "change-location",
                  locationId: "ub.model-uk.leeds",
                });

                l = LOCATIONS.find((l) => l.locationId === "ub.model-uk.leeds");
                if (l) {
                  setSelectedLocation(l);
                }
                break;

              case "ub.model-uk.glasgow-station":
                controlsDispatcher.dispatchEvent({
                  type: "change-location",
                  locationId: "ub.model-uk.glasgow-station",
                });

                l = LOCATIONS.find(
                  (l) => l.locationId === "ub.model-uk.glasgow-station"
                );
                if (l) {
                  setSelectedLocation(l);
                }
                break;
              case "ub.model-uk.st-james":
                controlsDispatcher.dispatchEvent({
                  type: "change-location",
                  locationId: "ub.model-uk.st-james",
                });

                l = LOCATIONS.find(
                  (l) => l.locationId === "ub.model-uk.st-james"
                );
                if (l) {
                  setSelectedLocation(l);
                }
                break;
              default:
                controlsDispatcher.dispatchEvent({
                  type: "change-location",
                  locationId: "ub.model-uk.uk-map",
                });

                l = LOCATIONS.find(
                  (l) => l.locationId === "ub.model-uk.uk-map"
                );
                if (l) {
                  setSelectedLocation(l);
                }

                break;
            }
          }
        }
      );
    }
  }, [client]);

  return (
    <DispatcherContext.Provider
      value={{
        client,
        controlsDispatcher,
        locations,
        selectedLocation,
      }}
    >
      {props.children}
    </DispatcherContext.Provider>
  );
};

export default DashboardProvider;
