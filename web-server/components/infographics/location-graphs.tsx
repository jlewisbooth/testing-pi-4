import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import Context from "../context/dispatcher";

import TowerBridgeGraphs from "./tb-graphs";
import RaglanCastleGraphs from "./rc-graphs";

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding: 20px;
`;

export default function LocationGraphs() {
  const selectedLocation = useContext(Context).selectedLocation;

  return (
    <Wrapper>
      {selectedLocation.locationId === "ub.model-uk.tower-bridge" && (
        <TowerBridgeGraphs />
      )}
      {selectedLocation.locationId === "ub.model-uk.raglan-castle" && (
        <RaglanCastleGraphs />
      )}
    </Wrapper>
  );
}
