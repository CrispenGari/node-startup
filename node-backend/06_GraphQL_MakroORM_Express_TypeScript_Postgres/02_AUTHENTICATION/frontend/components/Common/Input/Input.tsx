import React from "react";
import styles from "./Input.module.css";
interface Props {
  placeholder?: string;
  value?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  type: string;
}
const Input: React.FC<Props> = ({
  type,
  placeholder,
  value,
  error,
  onChange,
}) => {
  return (
    <div className={styles.input}>
      <input
        type={type}
        placeholder={placeholder}
        onChange={onChange}
        value={value}
      />
      <p>{error}</p>
    </div>
  );
};

export default Input;
