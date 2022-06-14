import styled from "styled-components";
import { Typography } from "antd";
import { useContext, useState } from "react";
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
`;

const Location = ({
  title,
  locationId,
  selectedId,
}: {
  title: string;
  locationId: string;
  selectedId: string | null;
}) => {
  return (
    <LocationContainer>
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
            />
          );
        })}
      </Container>
    </Wrapper>
  );
}
