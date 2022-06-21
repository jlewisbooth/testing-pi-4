import styled from "styled-components";
import LocationList from "./location-list";
import LocationDetails from "./location-details";
import LocationGraphs from "./location-graphs";

const Container = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: 10;
  top: 0px;
  left: 0px;
  pointer-events: none;

  display: flex;
  flex-direction: column;
`;

export default function Infographics() {
  return (
    <Container>
      <LocationList />
      <LocationDetails />
      <LocationGraphs />
    </Container>
  );
}
