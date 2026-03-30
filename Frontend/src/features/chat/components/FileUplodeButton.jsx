import React, { useRef } from "react";
import { PaperclipIcon } from "../icons";

const FileUploadButton = ({ onFileSelect, disabled = false }) => {
  const fileInputRef = useRef(null);

  const handleClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && onFileSelect) {
      onFileSelect(file);
    }

    // Clear the input so selecting the same file again still triggers change.
    e.target.value = null;
  };

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className="hidden h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white/10 hover:text-white disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-400 md:flex"
      >
        <PaperclipIcon />
      </button>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.txt,image/*"
        className="hidden"
      />
    </div>
  );
};

export default FileUploadButton;
