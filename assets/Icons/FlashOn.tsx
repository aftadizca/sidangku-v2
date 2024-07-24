import * as React from "react";
import Svg, { Path } from "react-native-svg";

function FlashOn(props: any) {
  return (
    <Svg
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.232 2.287A.75.75 0 0113.75 3v6.25H19a.75.75 0 01.607 1.191l-8 11a.75.75 0 01-1.357-.44v-6.25H5a.75.75 0 01-.607-1.192l8-11a.75.75 0 01.839-.272z"
        fill="#000"
      />
    </Svg>
  );
}

export default FlashOn;
