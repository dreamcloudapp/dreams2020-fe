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

export const ExpandFullscreen = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" {...props}>
    <path
      fill="currentColor"
      d="M32 32C14.3 32 0 46.3 0 64v96c0 17.7 14.3 32 32 32s32-14.3 32-32V96h64c17.7 0 32-14.3 32-32s-14.3-32-32-32H32zm32 320c0-17.7-14.3-32-32-32S0 334.3 0 352v96c0 17.7 14.3 32 32 32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H64v-64zM320 32c-17.7 0-32 14.3-32 32s14.3 32 32 32h64v64c0 17.7 14.3 32 32 32s32-14.3 32-32V64c0-17.7-14.3-32-32-32h-96zm128 320c0-17.7-14.3-32-32-32s-32 14.3-32 32v64h-64c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c17.7 0 32-14.3 32-32v-96z"
    />
  </svg>
);

export const ContractFullscreen = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" {...props}>
    <path
      fill="currentColor"
      d="M160 64c0-17.7-14.3-32-32-32S96 46.3 96 64v64H32c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c17.7 0 32-14.3 32-32V64zM32 320c-17.7 0-32 14.3-32 32s14.3 32 32 32h64v64c0 17.7 14.3 32 32 32s32-14.3 32-32v-96c0-17.7-14.3-32-32-32H32zM352 64c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7 14.3 32 32 32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32h-64V64zm-32 256c-17.7 0-32 14.3-32 32v96c0 17.7 14.3 32 32 32s32-14.3 32-32v-64h64c17.7 0 32-14.3 32-32s-14.3-32-32-32h-96z"
    />
  </svg>
);

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
