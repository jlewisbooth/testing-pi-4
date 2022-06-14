import React, { useContext, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import Context from "../context/dispatcher";
import { useTransition, animated, config } from "@react-spring/web";

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding: 20px;
`;

const Container = styled.div`
  padding: 15px;
  border-radius: 10px;
  background-color: white;
  border: solid 1px #540096;
  box-shadow: #666666 1px 1px 14px 0px;

  display: flex;
  flex-direction: column;
  align-items: center;

  max-width: 370px;
  min-height: 400px;

  position: relative;

  @supports (
    (-webkit-backdrop-filter: blur(2em)) or (backdrop-filter: blur(2em))
  ) {
    background-color: rgba(220, 220, 220, 0.7);
    -webkit-backdrop-filter: blur(5px) saturate(100%) contrast(45%)
      brightness(130%);
    backdrop-filter: blur(5px) saturate(100%) contrast(45%) brightness(130%);
  }
`;

export default function LocationGraphs() {
  const selectedLocation = useContext(Context).selectedLocation;
  const optionsRef = useRef<any>(null!);
  const [showGraphs, setShowGraphs] = useState<boolean>(false);

  const chart = useRef();

  useEffect(() => {
    setShowGraphs(true);
  }, []);

  return (
    <Wrapper>
      <Container>
        {/* {showGraphs && (
          
        )} */}
      </Container>
    </Wrapper>
  );
}
