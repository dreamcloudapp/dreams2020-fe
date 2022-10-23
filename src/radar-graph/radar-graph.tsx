import { ContentCategory, RadarPersonData } from "@kannydennedy/dreams-2020-types";
import { useMemo, useState } from "react";
import Legend from "../bubble-graph/legend";
import { CollectionCheck } from "../ducks/ui";
import useMediaQuery from "../hooks/useDimensions";
import {
  RadarChart as RadarVis,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from "recharts";

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

const CHART_MARGIN = 40;

type RadarGraphProps = {
  data: RadarPersonData[];
  width: number;
};

export function RadarGraph({ data, width }: RadarGraphProps) {
  const { isMobile, isTablet, isSmallDesktop } = useMediaQuery();

  const numGraphsPerRow = isMobile ? 1 : isTablet ? 2 : isSmallDesktop ? 3 : 4;

  // Dummy
  const radarWidth = width / numGraphsPerRow - CHART_MARGIN * 2;

  const [showingPeople, setShowingPeople] = useState<CollectionCheck[]>(
    data.map((person, i) => {
      return {
        label: person.name,
        // We'll just show "Baselines F" and "Tita Journal" for starters
        checked: person.name === "Baselines F" || person.name === "Mary Journal",
        color: person.meta.color,
      };
    })
  );

  // We need to return an array of arrays, e.g.
  // const x = [
  //   {
  //     title: "Perception",
  //     radarData: [
  //       {
  //         subject: "Math",
  //         mary: 120,
  //         john: 110,
  //         fullMark: 150,
  //       },
  //       {
  //         subject: "Chinese",
  //         mary: 120,
  //         john: 110,
  //         fullMark: 150,
  //       },
  //     ],
  //   },
  // ];
  const rechartsRadarData = useMemo(() => {
    return allRadarChartNames.map((chartCategory, i) => {
      const name = chartCategory;
      const activePeople = data.filter((_, i) => showingPeople[i].checked);

      // Radar data is an array of objects, where each object is a radar segment
      const radarData: any = Object.keys(activePeople[0].data[chartCategory]).map(
        (key, i) => {
          const ret = {
            subject: key,
            fullMark: 1,
          };
          activePeople.forEach((person, i) => {
            (ret as any)[person.name] = person.data[chartCategory][key];
          });
          return ret;
        }
      );

      return {
        title: name,
        radarData,
      };
    });
  }, [data, showingPeople]);

  // console.log(rechartsRadarData);

  const handleCheck = (label: string) => {
    // If every label is checked
    // Uncheck everything except for the one that was clicked
    if (showingPeople.every(p => p.checked)) {
      setShowingPeople(
        showingPeople.map(p => {
          return {
            ...p,
            checked: p.label === label,
          };
        })
      );
    }
    // If the last label is being unchecked
    // Check everything
    else if (
      showingPeople.filter(p => p.checked).length === 1 &&
      showingPeople.find(p => p.label === label)?.checked
    ) {
      setShowingPeople(
        showingPeople.map(p => {
          return {
            ...p,
            checked: true,
          };
        })
      );
    } else {
      setShowingPeople(
        showingPeople.map(p => {
          if (p.label === label) {
            return {
              ...p,
              checked: !p.checked,
            };
          }
          return p;
        })
      );
    }
  };

  return (
    <div style={{ paddingTop: 50 }}>
      {rechartsRadarData.map((radar, i) => {
        return (
          <div
            style={{
              margin: CHART_MARGIN,
              display: "inline-block",
            }}
          >
            <h3 style={{ fontWeight: "normal" }}>{radar.title}</h3>
            <RadarVis
              outerRadius={90}
              width={radarWidth}
              height={radarWidth}
              data={radar.radarData}
              onMouseEnter={x => {
                console.log(x);
              }}
              style={{ margin: 0 }}
            >
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={90} domain={[0, 1]} />
              {showingPeople.map((person, i) => {
                return (
                  <Radar
                    name={person.label}
                    dataKey={person.label}
                    stroke={person.color}
                    fill={person.color}
                    fillOpacity={0.6}
                  />
                );
              })}

              <Tooltip />
            </RadarVis>
          </div>
        );
      })}
      <Legend checkedCollections={showingPeople} handleCheck={handleCheck} />
    </div>
  );
}
