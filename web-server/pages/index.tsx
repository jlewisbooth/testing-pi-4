import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import AnimationLayout from "../components/animation";
import { ControlsDispatcher } from "../src/util/controls-dispatcher";
import styled from "styled-components";

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  padding: 0px;
  margin: 0px;
`;

const ContentContainer = styled.main`
  width: 100%;
  height: 100vh;
  position: relative;
`;

const Home: NextPage = () => {
  const [controlsDispatcher] = useState(new ControlsDispatcher());

  return (
    <Container>
      <ContentContainer>
        <AnimationLayout controlsDispatcher={controlsDispatcher} />
      </ContentContainer>
    </Container>
  );
};

export default Home;
