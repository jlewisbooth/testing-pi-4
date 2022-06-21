import React, { useContext, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Typography } from "antd";
import Context from "../context/dispatcher";
import { useTransition, animated, config } from "@react-spring/web";
import {
  Chart as ChartJS,
  ArcElement,
  Title,
  PieController,
  DoughnutController,
} from "chart.js";

ChartJS.register(ArcElement, Title, PieController);

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

const ChartWrapper = styled.div`
  position: relative;
  width: 170px;
  height: 170px;

  border-right: 1px solid silver;

  &:last-child {
    border-right: none;
  }
`;

const ChartValue = styled.span`
  position: absolute;
  left: 50%;
  bottom: 28px;
  transform: translate(-50%, 0%);

  font-weight: bold;
  color: #540096;
`;

const ChartContainer = styled.canvas`
  width: 100px;
  height: 100px;
  max-width: 170px;
  max-height: 170px;
  position: relative;
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

export default function LocationGraphs() {
  const controlsDispatcher = useContext(Context).controlsDispatcher;

  const leftTowerChartRef = useRef<HTMLCanvasElement>(null!);
  const leftTowerValueRef = useRef<HTMLSpanElement>(null!);
  const [leftTowerChart, setLeftTowerChart] = useState<ChartJS | null>(null);

  const rightTowerChartRef = useRef<HTMLCanvasElement>(null!);
  const rightTowerValueRef = useRef<HTMLSpanElement>(null!);
  const [rightTowerChart, setRightTowerChart] = useState<ChartJS | null>(null);

  const leftBasculeChartRef = useRef<HTMLCanvasElement>(null!);
  const leftBasculeValueRef = useRef<HTMLSpanElement>(null!);
  const [leftBasculeChart, setLeftBasculeChart] =
    useState<ChartJS | null>(null);

  const rightBasculeChartRef = useRef<HTMLCanvasElement>(null!);
  const rightBasculeValueRef = useRef<HTMLSpanElement>(null!);
  const [rightBasculeChart, setRightBasculeChart] =
    useState<ChartJS | null>(null);

  const [towerData] = useState({
    datasets: [
      {
        label: "Tilt",
        data: [Math.PI / 2, 0, Math.PI / 2],
        backgroundColor: [
          "rgba(0,0,0, 0.0)",
          "rgba(84,0,150, 0.5)",
          "rgba(0,0,0, 0.0)",
        ],
        borderWidth: 1,
      },
    ],
  });

  const [leftBasculeData] = useState({
    datasets: [
      {
        label: "Tilt",
        data: [Math.PI / 2, 0],
        backgroundColor: ["rgba(0,0,0, 0.0)", "rgba(84,0,150, 0.5)"],
        borderWidth: 1,
      },
    ],
  });

  const [rightBasculeData] = useState({
    datasets: [
      {
        label: "Tilt",
        data: [0, Math.PI / 2],
        backgroundColor: ["rgba(84,0,150, 0.5)", "rgba(0,0,0, 0.0)"],
        borderWidth: 1,
      },
    ],
  });

  useEffect(() => {
    let clt: ChartJS | undefined,
      crt: ChartJS | undefined,
      clb: ChartJS | undefined,
      crb: ChartJS | undefined;

    let ltctx = leftTowerChartRef.current.getContext("2d");
    let rtctx = rightTowerChartRef.current.getContext("2d");
    let lbctx = leftBasculeChartRef.current.getContext("2d");
    let rbctx = rightBasculeChartRef.current.getContext("2d");

    if (ltctx) {
      clt = new ChartJS(ltctx, {
        type: "pie",
        data: towerData,
        options: {
          animation: false,
          circumference: 180,
          rotation: -90,
          radius: "90%",
          layout: {
            padding: {
              top: 20,
            },
          },
          plugins: {
            title: {
              display: true,
              text: "Left Tower",
              position: "bottom",
            },
          },
        },
      });

      setLeftTowerChart(clt);
    }

    if (rtctx) {
      crt = new ChartJS(rtctx, {
        type: "pie",
        data: towerData,
        options: {
          animation: false,
          circumference: 180,
          rotation: -90,
          layout: {
            padding: {
              top: 20,
            },
          },
          radius: "90%",
          plugins: {
            title: {
              display: true,
              text: "Right Tower",
              position: "bottom",
            },
          },
        },
      });

      setLeftTowerChart(crt);
    }

    if (lbctx) {
      clb = new ChartJS(lbctx, {
        type: "pie",
        data: leftBasculeData,
        options: {
          animation: false,
          circumference: 90,
          rotation: 0,
          radius: "70%",
          plugins: {
            title: {
              display: true,
              text: "Left Bascule",
              position: "bottom",
            },
          },
        },
      });

      setLeftTowerChart(clb);
    }

    if (rbctx) {
      crb = new ChartJS(rbctx, {
        type: "pie",
        data: rightBasculeData,
        options: {
          animation: false,
          circumference: 90,
          rotation: -90,
          radius: "70%",
          plugins: {
            title: {
              display: true,
              text: "Right Bascule",
              position: "bottom",
            },
          },
        },
      });

      setLeftTowerChart(crb);
    }

    return () => {
      if (clt) {
        clt.destroy();
        setLeftTowerChart(null);
      }

      if (crt) {
        crt.destroy();
        setRightTowerChart(null);
      }

      if (clb) {
        clb.destroy();
        setLeftBasculeChart(null);
      }

      if (crb) {
        crb.destroy();
        setRightBasculeChart(null);
      }
    };
  }, []);

  useEffect(() => {
    function updateValues({ packet }: { packet: any }) {
      if (
        packet.locationId === "ub.model-uk.raglan-castle" &&
        packet.type === "env"
      ) {
        let { leftTower, rightTower, leftBridge, rightBridge } = packet.data;

        leftTowerChart?.data.datasets.forEach((dataset) => {
          if (leftTower <= 0) {
            dataset.data = [Math.PI / 2 - leftTower, leftTower, Math.PI / 2];
          } else {
            dataset.data = [Math.PI / 2, leftTower, Math.PI / 2 - leftTower];
          }
        });
        rightTowerChart?.data.datasets.forEach((dataset) => {
          if (rightTower <= 0) {
            dataset.data = [Math.PI / 2 - rightTower, rightTower, Math.PI / 2];
          } else {
            dataset.data = [Math.PI / 2, rightTower, Math.PI / 2 - rightTower];
          }
        });
        leftBasculeChart?.data.datasets.forEach((dataset) => {
          if (leftBridge <= 0) {
            dataset.data = [Math.PI / 2 + leftBridge, -leftBridge];
          } else {
            dataset.data = [Math.PI / 2 - leftBridge, leftBridge];
          }
        });
        rightBasculeChart?.data.datasets.forEach((dataset) => {
          if (rightBridge <= 0) {
            dataset.data = [Math.PI / 2 + rightBridge, -rightBridge];
          } else {
            dataset.data = [Math.PI / 2 - rightBridge, rightBridge];
          }
        });

        leftTowerValueRef.current.innerHTML = `${
          Math.round(leftTower * 100) / 100
        }`;
        rightTowerValueRef.current.innerHTML = `${
          Math.round(rightTower * 100) / 100
        }`;
        leftBasculeValueRef.current.innerHTML = `${
          Math.round(Math.abs(leftBridge) * 100) / 100
        }`;
        rightBasculeValueRef.current.innerHTML = `${
          Math.round(Math.abs(rightBridge) * 100) / 100
        }`;
      }
    }

    const eventName = "ub.model-uk.raglan-castle=>env";
    if (
      leftBasculeChart &&
      rightBasculeChart &&
      leftTowerChart &&
      rightTowerChart &&
      controlsDispatcher
    ) {
      controlsDispatcher.addEventListener(eventName, updateValues);
    }

    return () => {
      if (
        leftBasculeChart &&
        rightBasculeChart &&
        leftTowerChart &&
        rightTowerChart &&
        controlsDispatcher
      ) {
        controlsDispatcher.removeEventListener(eventName, updateValues);
      }
    };
  }, [leftTowerChart, rightTowerChart, leftBasculeChart, rightBasculeChart]);

  return (
    <Wrapper>
      <Container>
        <Header>
          <Text style={{ color: "white" }}>Tower Bridge Measurements</Text>
        </Header>
        <ChartWrapper>
          <ChartValue ref={leftTowerValueRef}>0&#176;</ChartValue>
          <ChartContainer ref={leftTowerChartRef} />
        </ChartWrapper>
        <ChartWrapper>
          <ChartValue ref={leftBasculeValueRef}>0&#176;</ChartValue>
          <ChartContainer ref={leftBasculeChartRef} />
        </ChartWrapper>
        <ChartWrapper>
          <ChartValue ref={rightBasculeValueRef}>0&#176;</ChartValue>
          <ChartContainer ref={rightBasculeChartRef} />
        </ChartWrapper>
        <ChartWrapper>
          <ChartValue ref={rightTowerValueRef}>0&#176;</ChartValue>
          <ChartContainer ref={rightTowerChartRef} />
        </ChartWrapper>
      </Container>
    </Wrapper>
  );
}
