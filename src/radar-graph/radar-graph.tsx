import { RadarPersonData } from "@kannydennedy/dreams-2020-types";
import { useState } from "react";
import RadarChart from "react-svg-radar-chart";
import "react-svg-radar-chart/build/css/index.css";

type RadarGraphProps = {
  data: RadarPersonData[];
  width: number;
  //   height: number;
  //   padding: Padding;
  //   handleMouseOver: (event: any, datum: any) => void;
  //   onMouseOut: () => void;
};

const testdata = [
  {
    name: "John",
    data: {
      battery: 0.7,
      design: 0.8,
      useful: 0.9,
      speed: 0.67,
      weight: 0.8,
    },
    meta: { color: "blue" },
  },
  {
    data: {
      battery: 0.6,
      design: 0.85,
      useful: 0.5,
      speed: 0.6,
      weight: 0.7,
    },
    meta: { color: "red" },
  },
];

const captions = {
  // columns
  battery: "Battery Capacity",
  design: "Design",
  useful: "Usefulness",
  speed: "Speed",
  weight: "Weight",
};

export function RadarGraph({
  data,
  width,
}: //   width,
//   height,
//   handleMouseOver,
//   onMouseOut,
//   padding,
RadarGraphProps) {
  // Dummy
  const radarWidth = width / 4;

  const [showingPeople, setShowingPeople] = useState(
    data.map((person, i) => {
      return {
        name: person.name,
        showing: true,
      };
    })
  );

  const allRadars = data[0] ? Object.keys(data[0].data) : [];

  // const columnWidth = (width - (COLUMN_GAP * data.length - 1)) / data.length;
  return (
    <div>
      <RadarChart captions={captions} data={testdata} size={radarWidth} />
    </div>
  );
}
