import React, { useRef, useEffect } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

interface QuillProps {
  value: string;
  onChange: (html: string) => void;
  height?: number;
}

// Define the toolbar configuration with image button
const toolbarOptions = [
  [{ header: [1, 2, false] }],
  ["bold", "italic", "underline", "strike"],
  [{ list: "ordered" }, { list: "bullet" }],
  ["link", "image"], // Image button is included here
  ["clean"],
];

export const QuillEditor: React.FC<QuillProps> = ({
  value,
  onChange,
  height = 200,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillInstance = useRef<Quill | null>(null);

  useEffect(() => {
    if (editorRef.current && !quillInstance.current) {
      // --- START: FIX FOR URL-ONLY IMAGE INSERTION ---
      const imageHandler = () => {
        // 1. Prompt the user for the image URL
        const url = prompt("Enter the image URL:");

        if (url) {
          // 2. Get the current editor instance
          const quill = quillInstance.current;

          if (quill) {
            // 3. Get the cursor position
            const range = quill.getSelection(true);
            const index = range ? range.index : 0;

            // 4. Insert the image into the editor at the current cursor position
            quill.insertEmbed(index, "image", url, Quill.sources.USER);

            // 5. Move cursor past the newly inserted image
            quill.setSelection(index + 1, 0);
          }
        }
      };
      // --- END: FIX FOR URL-ONLY IMAGE INSERTION ---

      // 1. Initialize Quill instance
      quillInstance.current = new Quill(editorRef.current, {
        theme: "snow",
        modules: {
          toolbar: {
            container: toolbarOptions,
            // Add the custom image handler here!
            handlers: {
              image: imageHandler,
            },
          },
        },
        placeholder: "Enter content...",
      });

      // ... (rest of useEffect logic remains the same)

      // 2. Load initial HTML content
      quillInstance.current.root.innerHTML = value;

      // 3. Set up the change listener to update parent component state
      quillInstance.current.on("text-change", () => {
        const html = quillInstance.current?.root.innerHTML || "";
        onChange(html === "<p><br></p>" || html === "<p></p>" ? "" : html);
      });
    }

    return () => {
      quillInstance.current = null;
    };
  }, []);

  // Update content externally
  useEffect(() => {
    if (
      quillInstance.current &&
      value !== quillInstance.current.root.innerHTML
    ) {
      const selection = quillInstance.current.getSelection();
      quillInstance.current.root.innerHTML = value;
      if (selection) {
        quillInstance.current.setSelection(
          selection.index,
          selection.length,
          "silent"
        );
      }
    }
  }, [value]);

  return (
    <div className="text-editor-container" style={{ height: `${height}px` }}>
      <div ref={editorRef} style={{ height: "100%" }} />
    </div>
  );
};
