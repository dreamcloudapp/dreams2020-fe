import React from "react";

type MediaBoolean = "isTablet" | "isMobile" | "isSmallDesktop";

type MediaQuery = { key: MediaBoolean; query: string };

export type MediaBooleanDict = {
  [key: string]: boolean;
};

const QUERIES: MediaQuery[] = [
  { key: "isSmallDesktop", query: "screen and (max-width: 1350px)" },
  { key: "isTablet", query: "screen and (max-width: 1150px)" },
  { key: "isMobile", query: "screen and (max-width: 600px)" },
];

const mediaQueryLists = QUERIES.map(q => ({
  key: q.key,
  mediaQueryList: window.matchMedia(q.query),
}));

export default function useMediaQuery() {
  const updateMediaQueryMatch = (mq: any) => (state: any) => ({
    ...state,
    [mq.key]: mq.mediaQueryList.matches,
  });

  const [values, setValues] = React.useState(() =>
    mediaQueryLists.reduce((acc, mq) => updateMediaQueryMatch(mq)(acc), {})
  );

  React.useEffect(() => {
    const listeners = mediaQueryLists.map(mq => {
      const handler = () => setValues(updateMediaQueryMatch(mq));
      mq.mediaQueryList.addListener(handler);
      return {
        handler,
        mq,
      };
    });

    return () =>
      listeners.forEach(listener =>
        listener.mq.mediaQueryList.removeListener(listener.handler)
      );
  }, []);

  return values as MediaBooleanDict;
}
