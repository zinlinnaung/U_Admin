import React, { useState, useRef } from "react";
import Draggable from "react-draggable";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// --- Types ---
interface CertificateComponent {
  id: string;
  type: "name" | "date" | "text";
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontWeight: string;
}

// --- Sub-component to fix the findDOMNode error ---
const DraggableItem: React.FC<{
  comp: CertificateComponent;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onStop: (id: string, data: any) => void;
}> = ({ comp, isSelected, onSelect, onStop }) => {
  // This ref is required to bypass the findDOMNode error in React 18
  const nodeRef = useRef(null);

  return (
    <Draggable
      nodeRef={nodeRef}
      bounds="parent"
      defaultPosition={{ x: comp.x, y: comp.y }}
      onStop={(e, data) => onStop(comp.id, data)}
    >
      <div
        ref={nodeRef}
        onClick={() => onSelect(comp.id)}
        className={`position-absolute cursor-move ${
          isSelected ? "border border-primary border-dashed" : ""
        }`}
        style={{
          zIndex: 10,
          padding: "5px",
          whiteSpace: "nowrap",
        }}
      >
        <span
          style={{
            fontSize: `${comp.fontSize}px`,
            fontWeight: comp.fontWeight,
            fontFamily: "serif",
            color: "#000",
            userSelect: "none",
          }}
        >
          {comp.text}
        </span>
      </div>
    </Draggable>
  );
};

const CertificateEditor: React.FC = () => {
  const [backgroundImg, setBackgroundImg] = useState<string | null>(null);
  const [components, setComponents] = useState<CertificateComponent[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setBackgroundImg(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSidebarDragStart = (
    e: React.DragEvent,
    type: "name" | "date"
  ) => {
    e.dataTransfer.setData("componentType", type);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("componentType") as "name" | "date";
    if (!type || !editorRef.current) return;

    const rect = editorRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newComponent: CertificateComponent = {
      id: Date.now().toString(),
      type,
      text: type === "name" ? "Full Name" : new Date().toLocaleDateString(),
      x,
      y,
      fontSize: 24,
      fontWeight: "bold",
    };

    setComponents([...components, newComponent]);
    setSelectedId(newComponent.id);
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleStopDrag = (id: string, data: any) => {
    setComponents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, x: data.x, y: data.y } : c))
    );
  };

  const handleTextChange = (id: string, newText: string) => {
    setComponents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, text: newText } : c))
    );
  };

  const handleDelete = (id: string) => {
    setComponents((prev) => prev.filter((c) => c.id !== id));
    setSelectedId(null);
  };

  const handleGeneratePDF = async () => {
    if (!editorRef.current) return;
    setIsGenerating(true);
    setSelectedId(null); // Deselect to remove borders before capturing

    setTimeout(async () => {
      try {
        const canvas = await html2canvas(editorRef.current!, {
          useCORS: true,
          scale: 2,
          backgroundColor: null,
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation: canvas.width > canvas.height ? "l" : "p",
          unit: "px",
          format: [canvas.width, canvas.height],
        });

        pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
        pdf.save("certificate.pdf");
      } catch (error) {
        console.error("PDF Error:", error);
      } finally {
        setIsGenerating(false);
      }
    }, 100);
  };

  return (
    <div className="card card-custom shadow-sm">
      <div className="card-header border-0 pt-5">
        <h3 className="card-title align-items-start flex-column">
          <span className="card-label fw-bolder text-dark">
            Certificate Designer
          </span>
          <span className="text-muted mt-1 fw-bold fs-7">
            Drag and drop components to build your template
          </span>
        </h3>
        <div className="card-toolbar">
          {backgroundImg && (
            <button
              className="btn btn-sm btn-primary"
              onClick={handleGeneratePDF}
              disabled={isGenerating}
            >
              {isGenerating ? "Processing..." : "Export PDF"}
            </button>
          )}
        </div>
      </div>

      <div className="card-body">
        {!backgroundImg ? (
          <div className="d-flex flex-column flex-center min-h-400px bg-light rounded border-primary border-dashed p-10">
            <i className="la la-cloud-upload-alt fs-5x text-primary mb-5"></i>
            <h3 className="fs-2x fw-bolder text-dark mb-5">
              Upload Background
            </h3>
            <input
              type="file"
              accept="image/*"
              className="d-none"
              id="cert-up"
              onChange={handleImageUpload}
            />
            <label htmlFor="cert-up" className="btn btn-primary fw-bold">
              Select File
            </label>
          </div>
        ) : (
          <div className="row g-10">
            {/* Sidebar */}
            <div className="col-lg-3">
              <div className="bg-light rounded p-5 mb-5">
                <h6 className="fw-bolder mb-5">Available Items</h6>
                <div
                  className="bg-white border rounded p-4 mb-3 cursor-move shadow-xs border-hover-primary"
                  draggable
                  onDragStart={(e) => handleSidebarDragStart(e, "name")}
                >
                  <i className="la la-user-edit text-primary fs-2 me-2"></i>{" "}
                  Name Field
                </div>
                <div
                  className="bg-white border rounded p-4 cursor-move shadow-xs border-hover-primary"
                  draggable
                  onDragStart={(e) => handleSidebarDragStart(e, "date")}
                >
                  <i className="la la-calendar-check text-success fs-2 me-2"></i>{" "}
                  Date Field
                </div>
              </div>

              {selectedId && (
                <div className="bg-light rounded p-5">
                  <h6 className="fw-bolder mb-5">Edit Properties</h6>
                  {components
                    .filter((c) => c.id === selectedId)
                    .map((c) => (
                      <div key={c.id}>
                        <label className="form-label fs-7">Display Text</label>
                        <input
                          className="form-control form-control-solid mb-5"
                          value={c.text}
                          onChange={(e) =>
                            handleTextChange(c.id, e.target.value)
                          }
                        />
                        <button
                          className="btn btn-sm btn-light-danger w-100"
                          onClick={() => handleDelete(c.id)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Editor */}
            <div className="col-lg-9 bg-secondary rounded d-flex justify-content-center p-10 overflow-auto">
              <div
                ref={editorRef}
                className="position-relative bg-white shadow-lg"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                style={{ height: "fit-content" }}
              >
                <img
                  src={backgroundImg}
                  alt="Template"
                  style={{
                    maxWidth: "100%",
                    pointerEvents: "none",
                    display: "block",
                  }}
                />
                {components.map((comp) => (
                  <DraggableItem
                    key={comp.id}
                    comp={comp}
                    isSelected={selectedId === comp.id}
                    onSelect={setSelectedId}
                    onStop={handleStopDrag}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificateEditor;
