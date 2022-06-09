import { createContext } from "react";
import type { ControlsDispatcher } from "../../src/util/controls-dispatcher";

interface ProviderState {
  client: any;
  controlsDispatcher: ControlsDispatcher;
}

const DispatcherContext = createContext<ProviderState>(null!);

export default DispatcherContext;
