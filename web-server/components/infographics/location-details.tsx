import styled from "styled-components";
import { Typography, Image } from "antd";
import React, { useContext, useState } from "react";
import Context from "../context/dispatcher";
import { useTransition, animated, config } from "@react-spring/web";

const { Text, Title, Paragraph } = Typography;

const Wrapper = styled.div`
  width: 100%;
  flex-grow: 1;
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
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

const ImageContainer = styled.div`
  width: 80%;
  height: 80%;
  position: absolute;
  left: 50%;
  top: 60%;
  transform: translate(-50%, -50%);
  z-index: 0;
  opacity: 0.2;

  display: flex;
  justify-content: center;
  align-items: center;
`;

export default function LocationDetails() {
  const selectedLocation = useContext(Context).selectedLocation;

  const transitions = useTransition(selectedLocation, {
    from: { opacity: 0, x: 1 },
    enter: { opacity: 1, x: 0.5 },
    leave: { opacity: 0, x: 0 },
    config: config.gentle,
  });

  return (
    <Wrapper>
      {transitions((styles, location) => {
        return (
          <animated.div
            style={{
              opacity: styles.opacity,
              transform: styles.x.to([0, 1], [400, 0]).to((x: number) => {
                return `translate3d(${200 - x}px,0,0)`;
              }),
              position: "absolute",
            }}
          >
            {!location.hideDetails && (
              <Container>
                <Title
                  style={{
                    zIndex: 1,
                  }}
                >
                  {location ? location.title : ""}
                </Title>
                <Paragraph
                  style={{
                    zIndex: 1,
                    textAlign: "justify",
                  }}
                >
                  Lorem, ipsum dolor sit amet consectetur adipisicing elit.
                  Officiis consequatur voluptates reiciendis, impedit sed esse
                  nobis veritatis ad hic facilis accusamus aliquam animi,
                  commodi totam dolores vero laudantium, iure quia!
                </Paragraph>
                {!!selectedLocation.bgImage && (
                  <ImageContainer>
                    <Image
                      src={selectedLocation.bgImage}
                      style={{
                        height: "270px",
                        objectFit: "contain",
                      }}
                    />
                  </ImageContainer>
                )}
              </Container>
            )}
          </animated.div>
        );
      })}
    </Wrapper>
  );
}
