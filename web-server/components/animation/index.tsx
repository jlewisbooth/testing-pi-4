import React, { useState, useEffect, useRef, useContext } from "react";
import ThreeController from "../../src/3js/controllers/main-controller";
import Context from "../context/dispatcher";

import styled from "styled-components";

const ControlsListener = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
`;

const Container = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

interface Props {}

export declare type AnimationLayoutProps = React.PropsWithChildren<Props>;

export const AnimationLayout: React.FC<AnimationLayoutProps> = (props) => {
  const animatedRef = useRef<HTMLDivElement>(null!);
  const ctrlsRef = useRef<HTMLDivElement>(null!);

  const [controller, setController] = useState<ThreeController | null>(null);

  const controlsDispatcher = useContext(Context).controlsDispatcher;

  useEffect(() => {
    let c = new ThreeController({
      animationContainer: animatedRef.current,
      ctrlsContainer: ctrlsRef.current,
      controlsDispatcher: controlsDispatcher,
    });

    setController(c);

    return () => {
      if (c) {
        c.destroy();
      }

      setController(null);
    };
  }, []);

  return (
    <Container ref={animatedRef}>
      <ControlsListener id={"controls-listener"} ref={ctrlsRef} />
    </Container>
  );
};

export default AnimationLayout;
