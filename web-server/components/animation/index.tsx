import React, { useState, useEffect, useRef } from "react";
import ThreeController from "../../src/3js/controllers/main-controller";

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

interface Props {
  controlsDispatcher: any;
}

export declare type AnimationLayoutProps = React.PropsWithChildren<Props>;

export const AnimationLayout: React.FC<AnimationLayoutProps> = (props) => {
  const animatedRef = useRef<HTMLDivElement>(null!);
  const ctrlsRef = useRef<HTMLDivElement>(null!);

  const [controller, setController] = useState<ThreeController | null>(null);

  useEffect(() => {
    let c = new ThreeController({
      animationContainer: animatedRef.current,
      ctrlsContainer: ctrlsRef.current,
      controlsDispatcher: props.controlsDispatcher,
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
