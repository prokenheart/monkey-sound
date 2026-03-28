import { useEffect, useMemo, useState } from "react";

type WheelItem = {
  option: string;
  weight: number;
};

type Props = {
  data: WheelItem[];
  mustStartSpinning: boolean;
  prizeNumber: number;
  onStopSpinning?: () => void;
};

const size = 150;
const center = size / 2;
const radius = size / 2;

const polarToCartesian = (cx: number, cy: number, r: number, angle: number) => {
  const rad = (angle - 90) * (Math.PI / 180);
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
};

const describeArc = (
  x: number,
  y: number,
  r: number,
  startAngle: number,
  endAngle: number
) => {
  const start = polarToCartesian(x, y, r, endAngle);
  const end = polarToCartesian(x, y, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return `
    M ${x} ${y}
    L ${start.x} ${start.y}
    A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}
    Z
  `;
};

export default function WeightedWheel({
  data,
  mustStartSpinning,
  prizeNumber,
  onStopSpinning,
}: Props) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);

  const segments = useMemo(() => {
    const total = data.reduce((sum, item) => sum + item.weight, 0);
    let startAngle = 0;

    return data.map((item) => {
      const angle = (item.weight / total) * 360;
      const seg = {
        ...item,
        startAngle,
        endAngle: startAngle + angle,
        midAngle: startAngle + angle / 2,
      };
      startAngle += angle;
      return seg;
    });
  }, [data]);

  useEffect(() => {
    if (mustStartSpinning && !spinning) {
      const target = segments[prizeNumber];

      const randomAngle =
        target.startAngle +
        Math.random() * (target.endAngle - target.startAngle);

      const padding = 2; // độ
      const safeAngle = Math.min(
        target.endAngle - padding,
        Math.max(target.startAngle + padding, randomAngle)
      );

      const stopAngle = 360 - safeAngle;
      const extraSpin = 360 * 5;

      setSpinning(true);
      setRotation((prev) => {
        const current = prev % 360; // normalize
        const delta = 360 - current + stopAngle;
      
        return prev + extraSpin + delta;
      });

      setTimeout(() => {
        setSpinning(false);
        onStopSpinning && onStopSpinning();
      }, 4000);
    }
  }, [mustStartSpinning, segments, prizeNumber, spinning, onStopSpinning]);

  return (
    <div style={{ position: "relative", width: size, margin: "0 auto" }}>
      {/* 🎯 Pointer */}
      <div
        style={{
          position: "absolute",
          top: -5,
          left: "50%",
          transform: "translateX(-50%)",
          width: 0,
          height: 0,
          borderLeft: "12px solid transparent",
          borderRight: "12px solid transparent",
          borderTop: "20px solid yellow", // màu kim
          zIndex: 10,
        }}
      />

      {/* 🎡 Wheel */}
      <svg
        width={size}
        height={size}
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: spinning
            ? "transform 4s cubic-bezier(0.33,1,0.68,1)"
            : "none",
        }}
      >
        {segments.map((seg, i) => (
          <path
            key={i}
            d={describeArc(
              center,
              center,
              radius,
              seg.startAngle,
              seg.endAngle
            )}
            fill={["#5865F2", "#248046", "#4E5058", "#DA373C"][i % 4]}
          />
        ))}
      </svg>
    </div>
  );
}
