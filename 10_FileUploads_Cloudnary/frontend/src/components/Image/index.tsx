import React from "react";
import "./Image.css";
interface Props {
  image: string;
}
const Image: React.FC<Props> = ({ image }) => {
  return (
    <div className="image">
      <img src={image} alt="" />
    </div>
  );
};

export default Image;
