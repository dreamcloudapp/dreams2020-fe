type Orientation = "N" | "S" | "E" | "W";
type Coords = { x: number; y: number };

type TriangleProps = {
  width: number;
  height: number;
  orientation: Orientation;
  x: number; // Top left corner
  y: number; // Top left corner
  fill?: string;
};

const getPoints = ({
  width,
  height,
  orientation,
  x,
  y,
}: TriangleProps): Coords[] => {
  const topLeft: Coords = { x: x, y: y };
  const topRight: Coords = { x: x + width, y: y };
  const bottomLeft: Coords = { x: x, y: y + height };
  const bottomRight: Coords = { x: x + width, y: y + height };
  const topCenter: Coords = { x: x + width / 2, y: y };
  const bottomCenter: Coords = { x: x + width / 2, y: y + height };
  const leftCenter: Coords = { x: x, y: y + height / 2 };
  const rightCenter: Coords = { x: x + width, y: y + height / 2 };

  switch (orientation) {
    case "N":
      return [bottomLeft, bottomRight, topCenter];

    case "S":
      return [topLeft, topRight, bottomCenter];
    case "E":
      return [topLeft, bottomLeft, rightCenter];

    case "W":
      return [topRight, bottomRight, leftCenter];

    default:
      return [bottomLeft, bottomRight, topCenter];
  }
};

export const Triangle = ({
  width,
  height,
  orientation,
  x,
  y,
  fill,
}: TriangleProps) => {
  const points = getPoints({ width, height, orientation, x, y });
  const pointsString: string = points.reduce((acc, curr, i) => {
    const p = `${curr.x},${curr.y}`;
    return acc + (i === 0 ? p : ` ${p}`);
  }, "");

  console.log(points, pointsString);

  return (
    <polygon
      points={pointsString}
      style={{ fill: fill || "#000", stroke: fill || "#000", strokeWidth: 1 }}
    />
  );
};
