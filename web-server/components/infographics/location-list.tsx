import styled from "styled-components";
import { Typography } from "antd";
import { useCallback, useContext, useState } from "react";
import Context from "../context/dispatcher";

const { Text } = Typography;

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const Container = styled.div`
  padding: 10px;
  border-bottom-right-radius: 10px;
  border-bottom-left-radius: 10px;
  background-color: white;
  border: solid 1px #540096;
  border-top: none;
  box-shadow: #666666 1px 1px 14px 0px;

  display: flex;
  flex-direction: row;

  @supports (
    (-webkit-backdrop-filter: blur(2em)) or (backdrop-filter: blur(2em))
  ) {
    background-color: rgba(220, 220, 220, 0.7);
    -webkit-backdrop-filter: blur(5px) saturate(100%) contrast(45%)
      brightness(130%);
    backdrop-filter: blur(5px) saturate(100%) contrast(45%) brightness(130%);
  }
`;

const LocationContainer = styled.div`
  height: 15px;
  margin: 0px 8px;
  display: flex;
  justify-content: center;
  align-items: center;

  cursor: pointer;
  pointer-events: all;
`;

const Location = ({
  title,
  locationId,
  selectedId,
  onSelect,
}: {
  title: string;
  locationId: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) => {
  return (
    <LocationContainer
      onClick={() => {
        if (typeof onSelect === "function") {
          onSelect(locationId);
        }
      }}
    >
      <Text
        style={{
          transition: "0.4s",
          fontSize: selectedId === locationId ? "16px" : "13px",
          color: selectedId === locationId ? "#540096" : "#bbbbbb",
        }}
      >
        {title}
      </Text>
    </LocationContainer>
  );
};

export default function LocationList() {
  const locations = useContext(Context).locations;
  const selectedLocation = useContext(Context).selectedLocation;
  const controlsDispatcher = useContext(Context).controlsDispatcher;

  const selectProject = useCallback((locationId: string) => {
    if (controlsDispatcher) {
      controlsDispatcher.dispatchEvent({
        type: "ub.model-uk.controller=>select",
        packet: {
          locationId: "ub.model-uk.controller",
          type: "select",
          data: {
            locationId,
          },
        },
      });
    }
  }, []);

  return (
    <Wrapper>
      <Container>
        {locations.map((location) => {
          return (
            <Location
              title={location.title}
              locationId={location.locationId}
              selectedId={selectedLocation.locationId}
              key={location.locationId}
              onSelect={(id: string) => selectProject(id)}
            />
          );
        })}
      </Container>
    </Wrapper>
  );
}
