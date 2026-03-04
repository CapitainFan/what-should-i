import GoogleIcon from "./icons/GoogleIcon";
import AppleIcon from "./icons/AppleIcon";
import FaceBookIcon from "./icons/FaceBookIcon";
import DiskordIcon from "./icons/DiskordIcon";
import TelegramIcon from "./icons/TelegramIcon";

export const SocialIcons = () => {
  return (
    <div className="flex justify-center mt-3">
      <div className="flex gap-3 w-[322px] justify-center">
        <GoogleIcon />
        <AppleIcon />
        <FaceBookIcon />
        <DiskordIcon />
        <TelegramIcon />
      </div>
    </div>
  );
};