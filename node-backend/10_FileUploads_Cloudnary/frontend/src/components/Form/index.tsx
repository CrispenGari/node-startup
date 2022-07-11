import React, { useState } from "react";
import "./Form.css";
import Image from "../Image";
import axios from "axios";
interface Props {}
const Form: React.FunctionComponent<Props> = () => {
  const [image, setImage] = useState<string>();

  const upload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!image) {
      return;
    }
    const { data } = await axios.post("http://localhost:3001/api/upload", {
      data: image,
    });
    console.log(data.data);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const reader = new FileReader();
    if ((e.target as any).files[0]) {
      reader.readAsDataURL((e.target as any).files[0]);
    }
    reader.onload = (readerEvent) => {
      setImage((readerEvent as any).target.result);
    };
  };
  return (
    <form onSubmit={upload}>
      <input
        onChange={handleChange}
        type="file"
        accept="image/*"
        multiple={false}
      />
      <button>upload</button>
      {image && <Image image={image} />}
    </form>
  );
};

export default Form;
