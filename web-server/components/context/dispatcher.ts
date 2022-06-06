import { createContext } from "react";

interface ProviderState {
  client: any;
}

const DispatcherContext = createContext<ProviderState>(null!);

export default DispatcherContext;
