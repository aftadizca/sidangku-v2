import * as React from "react";
import Svg, { Path } from "react-native-svg";

function FlashOff(props: any) {
  return (
    <Svg
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M8.795 8.782L5 14h6v7l4-5.5m2.182-3L19 10h-6V3l-2.182 3M4 4l16 16"
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default FlashOff;
