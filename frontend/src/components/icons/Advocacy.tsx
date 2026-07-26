import * as React from "react";
import { CustomIconProps } from "./types";

export const AdvocacyIcon: React.FC<CustomIconProps> = ({ width = 179, height = 45 }) => {
  return (
    <img
      style={{
        objectFit: "contain"
      }}
      src="https://refinepharma.com/wp-content/uploads/2022/08/Refine_Pharma_pu-e1661163175540.png"
      alt=""
      width={width}
      height={height}
    />
  );
};
