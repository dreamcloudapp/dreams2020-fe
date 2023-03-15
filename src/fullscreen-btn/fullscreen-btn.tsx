import "./fullscreen-btn.css";
import { ContractFullscreen, ExpandFullscreen } from "../icons/icons";

type FullScreenButtonProps = {
  isFullscreen: boolean;
  onClick: () => void;
};

export function FullScreenButton({ isFullscreen, onClick }: FullScreenButtonProps): any {
  return (
    <button className="fullscreen-btn" onClick={onClick}>
      {isFullscreen ? (
        <ContractFullscreen height={20} width={20} />
      ) : (
        <ExpandFullscreen height={20} width={20} />
      )}
    </button>
  );
}
