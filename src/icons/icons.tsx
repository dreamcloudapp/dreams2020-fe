export function MinusIcon(props: any): any {
  return (
    <svg
      width={12}
      height={2}
      viewBox="0 0 12 2"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M11.5 0H.5a.5.5 0 00-.5.5v1a.5.5 0 00.5.5h11a.5.5 0 00.5-.5v-1a.5.5 0 00-.5-.5z"
        fill="#555"
      />
    </svg>
  );
}

export function PlusIcon(props: any): any {
  return (
    <svg
      width={12}
      height={12}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M11.5 5H7V.5a.5.5 0 00-.5-.5h-1a.5.5 0 00-.5.5V5H.5a.5.5 0 00-.5.5v1a.5.5 0 00.5.5H5v4.5a.5.5 0 00.5.5h1a.5.5 0 00.5-.5V7h4.5a.5.5 0 00.5-.5v-1a.5.5 0 00-.5-.5z"
        fill="#555"
      />
    </svg>
  );
}

type IconProps = {
  fill: string;
  x: number;
  y: number;
  scale: number;
  onClick: () => void;
};

export function ChevronRight({ fill, x, y, scale, onClick }: IconProps): any {
  return (
    <path
      fill={fill}
      transform={`translate(${x} ${y}) scale(${scale})`}
      onClick={onClick}
      d="M0 256c0 141.4 114.6 256 256 256s256-114.6 256-256S397.4 0 256 0 0 114.6 0 256zm241 121c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l87-87-87-87c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0L345 239c9.4 9.4 9.4 24.6 0 33.9L241 377z"
      style={{ cursor: "pointer" }}
    />
  );
}
