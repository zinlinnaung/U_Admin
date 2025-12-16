import React, { useRef, useEffect } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

// Define the component's expected properties
interface QuillProps {
  value: string;
  onChange: (html: string) => void;
  height?: number;
}

// 1. Define the toolbar configuration (no change needed here)
const toolbarOptions = [
  [{ header: [1, 2, false] }],
  ["bold", "italic", "underline", "strike"],
  [{ list: "ordered" }, { list: "bullet" }],
  ["link", "image", "video"],
  ["clean"],
];

// --- START: VIDEO BLOT REGISTRATION (Using <video> tag) ---

// FIX: Type assertion remains the same to resolve TypeScript errors
const BlockEmbed: any = Quill.import("blots/block/embed");

/**
 * Custom Blot for embedding direct video files using the HTML <video> tag.
 */
class VideoBlot extends BlockEmbed {
  static blotName = "video";
  static tagName = "video"; // CHANGED: Now outputs a <video> element

  static create(value: string) {
    const node = super.create(value) as HTMLVideoElement;

    // Set the direct video source URL
    node.setAttribute("src", value);

    // Set controls so the user can play/pause
    node.setAttribute("controls", "true");

    // Optional: Add styling for appearance and responsiveness
    node.setAttribute(
      "style",
      "width: 100%; max-width: 600px; height: auto; display: block; margin: 10px 0;"
    );
    node.setAttribute("preload", "metadata"); // Useful for faster loading

    return node;
  }

  static value(node: HTMLElement): string {
    return node.getAttribute("src") || "";
  }
}

// Register the custom Blot with Quill
Quill.register(VideoBlot);

// --- END: VIDEO BLOT REGISTRATION ---

export const QuillEditor: React.FC<QuillProps> = ({
  value,
  onChange,
  height = 200,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillInstance = useRef<Quill | null>(null);

  useEffect(() => {
    if (editorRef.current && !quillInstance.current) {
      const imageHandler = () => {
        const url = prompt("Enter the image URL:");

        if (url) {
          const quill = quillInstance.current;
          if (quill) {
            const range = quill.getSelection(true);
            const index = range ? range.index : 0;
            quill.insertEmbed(index, "image", url, Quill.sources.USER);
            quill.setSelection(index + 1, 0);
          }
        }
      };

      // --- Custom Video Handler (Simplified for direct <video> tag) ---
      const videoHandler = () => {
        // Prompt for the direct file link (like the one you provided)
        const url = prompt(
          "Enter the direct video file URL (.mp4, .mov, etc.):"
        );

        if (url) {
          const quill = quillInstance.current;
          if (quill) {
            const range = quill.getSelection(true);
            const index = range ? range.index : 0;

            // Insert the direct URL using the 'video' blot, which is now a <video> tag
            quill.insertEmbed(index, "video", url, Quill.sources.USER);

            quill.setSelection(index + 1, 0);
          }
        }
      };
      // --- END: Custom Video Handler ---

      // 1. Initialize Quill instance
      quillInstance.current = new Quill(editorRef.current, {
        theme: "snow",
        modules: {
          toolbar: {
            container: toolbarOptions,
            handlers: {
              image: imageHandler,
              video: videoHandler, // Uses the simplified, direct URL handler
            },
          },
        },
        placeholder: "Enter content...",
      });

      // 2. Load initial HTML content
      quillInstance.current.root.innerHTML = value;

      // 3. Set up the change listener to update parent component state
      quillInstance.current.on("text-change", () => {
        const html = quillInstance.current?.root.innerHTML || "";
        onChange(html === "<p><br></p>" || html === "<p></p>" ? "" : html);
      });
    }

    // Cleanup function
    return () => {
      quillInstance.current = null;
    };
  }, []);

  // Update content externally (prop changes)
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
