import type { NextPage } from "next";
import AnimationLayout from "../components/animation";
import Infographics from "../components/infographics";
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
  return (
    <Container>
      <ContentContainer>
        <AnimationLayout />
        <Infographics />
      </ContentContainer>
    </Container>
  );
};

export default Home;
