import { createContext } from "react";
import type { ControlsDispatcher } from "../../src/util/controls-dispatcher";

type Location = {
  title: string;
  locationId: string;
  bgImage?: string;
  isTrainStop?: boolean;
  hideDetails?: boolean;
};

interface ProviderState {
  client: any;
  controlsDispatcher: ControlsDispatcher;
  locations: Location[];
  selectedLocation: Location;
}

const DispatcherContext = createContext<ProviderState>(null!);

export default DispatcherContext;
