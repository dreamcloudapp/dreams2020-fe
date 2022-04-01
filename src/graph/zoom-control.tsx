import { MinusIcon, PlusIcon } from "../icons/icons";

type ZoomControlProps = {
  onZoomInClick: () => void;
  onZoomOutClick: () => void;
};

export const ZoomControl = ({ onZoomInClick, onZoomOutClick }: ZoomControlProps) => {
  return (
    <div>
      <div>
        <button
          className="mapboxgl-ctrl-icon mapboxgl-ctrl-zoom-in"
          type="button"
          title="Zoom In"
          onClick={onZoomInClick}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <PlusIcon />
        </button>
        <button
          className="mapboxgl-ctrl-icon mapboxgl-ctrl-zoom-out"
          type="button"
          title="Zoom Out"
          onClick={onZoomOutClick}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MinusIcon />
        </button>
      </div>
    </div>
  );
};
