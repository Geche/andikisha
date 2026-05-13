"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";

export interface TextEditorProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
  minHeight?: string;
}

/** 
 * Dynamically import ReactQuill (Prevents SSR issues in Next.js)
 */
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => <div className="text-gray-400">Loading editor...</div>,
});

const CommonTextEditor = ({
  value,
  defaultValue,
  onChange: externalOnChange,
  placeholder = "Enter text...",
  ariaLabel = "Text editor",
  className = "",
  minHeight = "120px",
}: TextEditorProps) => {
  const [internalValue, setInternalValue] = useState<string>(
    value || defaultValue || ""
  );

  const handleChange = useCallback(
    (content: string) => {
      setInternalValue(content);
      externalOnChange?.(content);
    },
    [externalOnChange]
  );

  const currentValue = value ?? internalValue;

  const modules = {
    toolbar: [
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }],
      ["link"],
    ],
  };

  const formats = ["bold", "italic", "underline", "strike", "list", "link"];

  return (
    <div
      role="textbox"
      aria-label={ariaLabel}
      className={`quill-style-editor ${className}`}
      style={{ minHeight }}
    >
      <ReactQuill
        theme="snow"
        className="snow-editor"
        value={currentValue}
        onChange={handleChange}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
      />
    </div>
  );
};

export default CommonTextEditor;
