import React, { useContext, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Typography } from "antd";
import Context from "../context/dispatcher";
import { useTransition, animated, config } from "@react-spring/web";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTemperatureHalf,
  faDroplet,
  faGauge,
} from "@fortawesome/free-solid-svg-icons";

const { Text } = Typography;

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding: 0px;
`;

const Container = styled.div`
  padding: 15px;
  border-radius: 10px;
  background-color: white;
  border: solid 1px #540096;
  box-shadow: #666666 1px 1px 14px 0px;

  display: flex;
  flex-direction: row;
  align-items: center;

  position: relative;

  max-height: 300px;

  @supports (
    (-webkit-backdrop-filter: blur(2em)) or (backdrop-filter: blur(2em))
  ) {
    background-color: rgba(220, 220, 220, 0.7);
    -webkit-backdrop-filter: blur(5px) saturate(100%) contrast(45%)
      brightness(130%);
    backdrop-filter: blur(5px) saturate(100%) contrast(45%) brightness(130%);
  }
`;

const Header = styled.div`
  position: absolute;
  top: 0px;
  left: 50%;

  transform: translate(-50%, -100%);
  padding: 5px 7px;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;

  background: linear-gradient(45deg, #540096 0%, #aa3174 100%);
`;

const ValueContainer = styled.div`
  display: flex;
  flex-direction: row;
  padding: 10px 20px;
  margin: 0px 5px;

  border-right: 1px solid silver;

  &:last-child {
    border-right: none;
  }
`;

const Value = styled.span`
  font-weight: bold;
  font-size: 25px;
`;

export default function RaglanCastleGraphs() {
  const controlsDispatcher = useContext(Context).controlsDispatcher;

  const tempRef = useRef<HTMLSpanElement>(null!);
  const humidRef = useRef<HTMLSpanElement>(null!);
  const pressureRef = useRef<HTMLSpanElement>(null!);

  useEffect(() => {
    function updateValues({ packet }: { packet: any }) {
      if (
        packet.locationId === "ub.model-uk.raglan-castle" &&
        packet.type === "env"
      ) {
        let { temperature, humidity, pressure } = packet.data;

        tempRef.current.innerHTML = `${Math.round(temperature * 100) / 100}`;
        humidRef.current.innerHTML = `${Math.round(humidity * 100) / 100}`;
        pressureRef.current.innerHTML = `${Math.round(pressure * 100) / 100}`;
      }
    }

    let eventName = "ub.model-uk.raglan-castle=>env";

    if (controlsDispatcher) {
      controlsDispatcher.addEventListener(eventName, updateValues);
    }

    return () => {
      if (controlsDispatcher) {
        controlsDispatcher.removeEventListener(eventName, updateValues);
      }
    };
  }, []);

  return (
    <Wrapper>
      <Container>
        <Header>
          <Text style={{ color: "white" }}>Raglan Castle Environment</Text>
        </Header>
        <ValueContainer>
          <FontAwesomeIcon
            icon={faTemperatureHalf}
            size={"3x"}
            style={{
              marginRight: 9,
            }}
            color={"red"}
          />
          <Value ref={tempRef}>0</Value>
          <Value
            style={{
              marginLeft: 4,
            }}
          >
            &#176;C
          </Value>
        </ValueContainer>
        <ValueContainer>
          <FontAwesomeIcon
            icon={faDroplet}
            size={"3x"}
            style={{
              marginRight: 9,
            }}
            color={"blue"}
          />
          <Value ref={humidRef}>0</Value>
          <Value>%</Value>
        </ValueContainer>
        <ValueContainer>
          <FontAwesomeIcon
            icon={faGauge}
            size={"3x"}
            style={{
              marginRight: 9,
            }}
            color={"#540096"}
          />
          <Value ref={pressureRef}>0</Value>
          <Value
            style={{
              marginLeft: 4,
            }}
          >
            hPa
          </Value>
        </ValueContainer>
      </Container>
    </Wrapper>
  );
}
