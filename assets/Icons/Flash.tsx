import * as React from "react";
import Svg, { Path } from "react-native-svg";

function FlashLight(props: any) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-flashlight"
      {...props}
    >
      <Path d="M18 6c0 2-2 2-2 4v10a2 2 0 01-2 2h-4a2 2 0 01-2-2V10c0-2-2-2-2-4V2h12z" />
      <Path d="M6 6L18 6" />
      <Path d="M12 12L12 12" />
    </Svg>
  );
}

export default FlashLight;
