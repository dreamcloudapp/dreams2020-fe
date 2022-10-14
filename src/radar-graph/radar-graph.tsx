import { ContentCategory, RadarPersonData } from "@kannydennedy/dreams-2020-types";
import { useMemo, useState } from "react";
import RadarChart, { ChartData } from "react-svg-radar-chart";
import "react-svg-radar-chart/build/css/index.css";

type ChartDataWithNameAndCaptions = {
  name: string;
  chartData: ChartData[];
  captions: { [key: string]: string };
};

const allRadarChartNames: ContentCategory[] = [
  "perception",
  "emotion",
  "characters",
  "social interactions",
  "movement",
  "cognition",
  "culture",
  "elements",
];

type RadarGraphProps = {
  data: RadarPersonData[];
  width: number;
  //   height: number;
  //   padding: Padding;
  //   handleMouseOver: (event: any, datum: any) => void;
  //   onMouseOut: () => void;
};

// Data has this format:
// const testdata: ChartData[] = [
//   {
//     data: {
//       battery: 0.7,
//       design: 0.8,
//       useful: 0.9,
//       speed: 0.67,
//       weight: 0.8,
//     },
//     meta: { color: "blue" },
//   },
//   {
//     data: {
//       battery: 0.6,
//       design: 0.85,
//       useful: 0.5,
//       speed: 0.6,
//       weight: 0.7,
//     },
//     meta: { color: "red" },
//   },
// ];

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

  // The data that goes in the radars
  const allRadarData = useMemo<ChartDataWithNameAndCaptions[]>(() => {
    console.log("showingPeople", setShowingPeople);

    // const peopleToShow = showingPeople.filter(p => p.showing);
    const ret: ChartDataWithNameAndCaptions[] = allRadarChartNames.map(
      (chartCategory, i) => {
        return {
          name: "dab",
          chartData: data.map((person, i) => {
            return {
              data: person.data[chartCategory],

              meta: {
                color: person.meta.color,
              },
            };
          }),
          captions: Object.keys(data[0].data[chartCategory]).reduce((acc, curr) => {
            return {
              ...acc,
              [curr]: curr,
            };
          }, {}),
        };
      }
    );
    return ret;
  }, [showingPeople, data]);

  console.log("allRadarData", allRadarData);

  // const columnWidth = (width - (COLUMN_GAP * data.length - 1)) / data.length;
  return (
    <div>
      {allRadarData.map((d, i) => {
        return (
          <RadarChart
            key={i}
            captions={d.captions}
            data={d.chartData}
            size={radarWidth}
          />
        );
      })}
    </div>
  );
}
