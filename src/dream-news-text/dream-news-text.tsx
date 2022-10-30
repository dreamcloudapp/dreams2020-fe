import { VisComparison } from "../ducks/ui";
import { useSelector } from "../ducks/root-reducer";
import { selectDreams, selectNews } from "../ducks/data";
import { SingleTextRecord } from "@kannydennedy/dreams-2020-types";
import useMediaQuery from "../hooks/useDimensions";
import { prettyDate } from "../modules/time-helpers";
import React from "react";

type DreamNewsTextProps = {
  focusedComparison: VisComparison | null;
};

const headingStyle: React.CSSProperties = {
  textAlign: "center",
  fontFamily: "Century Gothic",
  fontWeight: 400,
  fontSize: 16,
  margin: "0.5rem 0",
};

const subHeadingStyle: React.CSSProperties = {
  textAlign: "center",
  fontFamily: "Century Gothic",
  fontWeight: 400,
  fontSize: 14,
  fontStyle: "italic",
};

const blankRecord: SingleTextRecord = { id: "", text: "", date: new Date() };

export function DreamNewsText({ focusedComparison }: DreamNewsTextProps) {
  const { isMobile } = useMediaQuery();
  const dreams = useSelector(selectDreams);
  const news = useSelector(selectNews);

  // If we have dream and news ids, it's a special thing
  // We're comparing one dream and one news, not a set of them
  const dreamId = focusedComparison?.dreamId || "";
  const newsId = focusedComparison?.newsId || "";
  const hasDreamId = !!dreamId;
  const hasNewsId = !!newsId;
  const isSingleComparison: boolean = hasDreamId && hasNewsId;

  let textLeft: string = "";
  let textRight: string = "";
  const matchingDream: SingleTextRecord =
    isSingleComparison && dreams && dreams[dreamId] ? dreams[dreamId] : blankRecord;
  const matchingNews: SingleTextRecord =
    isSingleComparison && news && news[newsId] ? news[newsId] : blankRecord;

  if (isSingleComparison) {
    textLeft = matchingDream && matchingDream.id ? matchingDream.text : "Dream not found";
    textRight =
      matchingNews && matchingNews.id ? matchingNews.text : `News id ${newsId} not found`;
  } else {
    textLeft = "";
    textRight = "";
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        columnGap: 40,
        height: 300,
        fontFamily: "Calibri",
        fontWeight: 500,
      }}
    >
      {isSingleComparison && (
        <>
          <div style={{ overflow: "auto", width: isMobile ? "100%" : "50%" }}>
            <h5 style={headingStyle}>Dream</h5>
            <p style={subHeadingStyle}>
              {matchingDream.id ? prettyDate(new Date(matchingDream.date)) : "-"}, ID:{" "}
              {matchingDream.id}
            </p>
            <p>{textLeft}</p>
          </div>
          <div style={{ overflow: "auto", width: isMobile ? "100%" : "50%" }}>
            <h5 style={headingStyle}>News Summary</h5>
            <p style={subHeadingStyle}>
              {matchingNews.id ? prettyDate(new Date(matchingNews.date)) : "-"}, ID:{" "}
              {matchingNews.id}
            </p>
            <p>{textRight}</p>
          </div>
        </>
      )}
    </div>
  );
}
