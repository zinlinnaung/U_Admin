import React, { useState, useRef, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import axios from "axios";
import { KTIcon } from "../../../../_metronic/helpers";

// --- Types ---
interface Position {
  x: number;
  y: number;
}

interface ComponentData {
  id: string;
  type: "name" | "date";
  position: Position;
  value: string;
}

// Type for the data coming FROM the API
interface ApiTemplate {
  id: string;
  name: string;
  backgroundImage: string | null;
  components: {
    data: Array<{
      id: string;
      type: "name" | "date";
      position: Position;
      variableKey: string;
    }>;
  };
}

const ItemTypes = {
  COMPONENT: "component",
  PLACED_COMPONENT: "placed_component",
};

// --- Left Panel Draggable Item ---
const DraggableComponent: React.FC<{
  type: "name" | "date";
  label: string;
  icon: string;
}> = ({ type, label, icon }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.COMPONENT,
    item: { type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag as any}
      className={`card card-custom shadow-sm mb-4 cursor-move ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div className="card-body p-4 d-flex align-items-center">
        <div className="symbol symbol-40px me-3">
          <span className="symbol-label bg-light-primary">
            <KTIcon iconName={icon} className="fs-2 text-primary" />
          </span>
        </div>
        <div className="fw-bold text-gray-800">{label}</div>
      </div>
    </div>
  );
};

// --- Placed Component on Canvas ---
const PlacedComponent: React.FC<{
  component: ComponentData;
  selected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ component, selected, onSelect, onDelete }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.PLACED_COMPONENT,
    item: { id: component.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag as any}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(component.id);
      }}
      style={{
        position: "absolute",
        left: component.position.x,
        top: component.position.y,
        cursor: "move",
        fontSize: "24px",
        fontFamily: "Arial, sans-serif",
        color: "#000",
        fontWeight: "bold",
        border: selected ? "2px dashed #009ef7" : "2px dashed transparent",
        padding: "4px",
        opacity: isDragging ? 0 : 1,
        userSelect: "none",
        whiteSpace: "nowrap",
        zIndex: 10,
      }}
    >
      {component.value}
      {selected && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(component.id);
          }}
          className="btn btn-icon btn-sm btn-danger position-absolute"
          style={{
            top: "-12px",
            right: "-12px",
            height: "20px",
            width: "20px",
          }}
        >
          <KTIcon iconName="cross" className="fs-6" />
        </button>
      )}
    </div>
  );
};

// --- Main Editor ---
const CertificateEditor: React.FC = () => {
  const [templateName, setTemplateName] = useState("Certificate Template");
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [components, setComponents] = useState<ComponentData[]>([]);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(
    null
  );

  // Lists and Loading States
  const [availableTemplates, setAvailableTemplates] = useState<ApiTemplate[]>(
    []
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_URL =
    "https://mypadminapi.bitmyanmar.info/api/certificate-templates";

  // --- Fetch Templates on Mount ---
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setIsLoadingList(true);
    try {
      const response = await axios.get(API_URL);
      setAvailableTemplates(response.data);
    } catch (error) {
      console.error("Failed to fetch templates", error);
    } finally {
      setIsLoadingList(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) =>
        setBackgroundImage(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const [, drop] = useDrop(() => ({
    accept: [ItemTypes.COMPONENT, ItemTypes.PLACED_COMPONENT],
    drop: (item: any, monitor) => {
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      const clientOffset = monitor.getClientOffset();
      if (!canvasRect || !clientOffset) return;

      const x = Math.round(clientOffset.x - canvasRect.left);
      const y = Math.round(clientOffset.y - canvasRect.top);

      if (item.id) {
        setComponents((prev) =>
          prev.map((c) =>
            c.id === item.id ? { ...c, position: { x: x - 40, y: y - 15 } } : c
          )
        );
      } else {
        const newComp: ComponentData = {
          id: `${item.type}-${Date.now()}`,
          type: item.type,
          position: { x: x - 40, y: y - 15 },
          value: item.type === "name" ? "John Doe" : "12/12/2025",
        };
        setComponents((prev) => [...prev, newComp]);
        setSelectedComponentId(newComp.id);
      }
    },
  }));

  const deleteComponent = (id: string) => {
    setComponents((prev) => prev.filter((c) => c.id !== id));
    setSelectedComponentId(null);
  };

  // --- Load Template into Editor ---
  const loadTemplate = (template: ApiTemplate) => {
    setTemplateName(template.name);
    setBackgroundImage(template.backgroundImage);

    // Map backend JSON data back to local state array
    const loadedComponents: ComponentData[] = template.components.data.map(
      (comp) => ({
        id: comp.id,
        type: comp.type,
        position: comp.position,
        value: comp.type === "name" ? "John Doe" : "12/12/2025", // Default preview values
      })
    );

    setComponents(loadedComponents);
    setSelectedComponentId(null);
  };

  const handleSave = async () => {
    if (!backgroundImage) return alert("Please upload a background image.");

    setIsSaving(true);
    const payload = {
      id: `cert-${Date.now()}`,
      name: templateName,
      backgroundImage: backgroundImage,
      components: {
        data: components.map((c) => ({
          id: c.id,
          type: c.type,
          position: c.position,
          variableKey: c.type === "name" ? "{{student_name}}" : "{{date}}",
        })),
      },
    };

    try {
      await axios.post(API_URL, payload);
      alert("Template saved successfully!");
      fetchTemplates(); // Refresh the list
    } catch (error: any) {
      alert("Failed to save template.");
    } finally {
      setIsSaving(false);
    }
  };

  const generatePDF = async () => {
    if (!canvasRef.current) return;
    setIsGenerating(true);
    setSelectedComponentId(null);
    setTimeout(async () => {
      const canvas = await html2canvas(canvasRef.current!, {
        scale: 2,
        useCORS: true,
      });
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? "landscape" : "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        0,
        0,
        canvas.width,
        canvas.height
      );
      pdf.save(`${templateName}.pdf`);
      setIsGenerating(false);
    }, 100);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="d-flex flex-column flex-lg-row">
        {/* LEFT PANEL */}
        <div className="w-lg-300px me-lg-5 mb-5">
          <div className="card mb-5">
            <div className="card-body p-5">
              <label className="form-label fw-bold">Template Name</label>
              <input
                className="form-control mb-5"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
              <button
                className="btn btn-outline btn-outline-dashed btn-outline-primary w-100 mb-3"
                onClick={() => fileInputRef.current?.click()}
              >
                Upload Background
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="d-none"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>
          </div>

          <div className="card">
            <div className="card-header min-h-auto py-3">
              <h3 className="card-title fs-6">Drag Fields</h3>
            </div>
            <div className="card-body p-5">
              <DraggableComponent type="name" label="Name Field" icon="user" />
              <DraggableComponent
                type="date"
                label="Date Field"
                icon="calendar"
              />
            </div>
          </div>
        </div>

        {/* MIDDLE PANEL (Canvas) */}
        <div className="flex-lg-row-fluid me-lg-5 mb-5">
          <div className="card shadow-sm">
            <div className="card-header">
              <div className="card-title fs-4 fw-bold">Canvas</div>
              <div className="card-toolbar gap-2">
                <button
                  className="btn btn-sm btn-primary"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Template"}
                </button>
                <button
                  className="btn btn-sm btn-success"
                  onClick={generatePDF}
                  disabled={isGenerating}
                >
                  {isGenerating ? "Wait..." : "PDF Preview"}
                </button>
              </div>
            </div>
            <div
              className="card-body bg-light p-5 d-flex justify-content-center overflow-auto"
              style={{ minHeight: "650px" }}
            >
              <div
                ref={(el) => {
                  canvasRef.current = el;
                  drop(el);
                }}
                className="position-relative bg-white shadow-sm"
                style={{
                  width: "800px",
                  height: "565px",
                  backgroundImage: backgroundImage
                    ? `url(${backgroundImage})`
                    : "none",
                  backgroundSize: "contain",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
                onClick={() => setSelectedComponentId(null)}
              >
                {!backgroundImage && (
                  <div className="h-100 d-flex align-items-center justify-content-center text-gray-400">
                    Upload a background to start
                  </div>
                )}
                {components.map((c) => (
                  <PlacedComponent
                    key={c.id}
                    component={c}
                    selected={c.id === selectedComponentId}
                    onSelect={setSelectedComponentId}
                    onDelete={deleteComponent}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-lg-300px">
          {/* Properties Card */}
          <div className="card mb-5">
            <div className="card-header bg-primary py-3 min-h-auto">
              <h3 className="card-title fs-6 text-white">Properties</h3>
            </div>
            <div className="card-body p-5">
              {selectedComponentId ? (
                <div>
                  <label className="form-label fw-bold fs-8 text-muted">
                    PREVIEW TEXT
                  </label>
                  <input
                    className="form-control form-control-sm mb-4"
                    value={
                      components.find((c) => c.id === selectedComponentId)
                        ?.value || ""
                    }
                    onChange={(e) =>
                      setComponents((prev) =>
                        prev.map((c) =>
                          c.id === selectedComponentId
                            ? { ...c, value: e.target.value }
                            : c
                        )
                      )
                    }
                  />
                  <button
                    className="btn btn-sm btn-light-danger w-100"
                    onClick={() => deleteComponent(selectedComponentId)}
                  >
                    Delete Field
                  </button>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-5">
                  Select a field
                </div>
              )}
            </div>
          </div>

          {/* Templates List Card */}
          <div className="card">
            <div className="card-header bg-success py-3 min-h-auto">
              <h3 className="card-title fs-6 text-white">
                Available Templates
              </h3>
            </div>
            <div
              className="card-body p-0 scroll-y"
              style={{ maxHeight: "400px" }}
            >
              {isLoadingList ? (
                <div className="p-5 text-center">Loading...</div>
              ) : (
                <div className="list-group list-group-flush">
                  {availableTemplates.map((tpl) => (
                    <button
                      key={tpl.id}
                      className="list-group-item list-group-item-action p-4 d-flex align-items-center"
                      onClick={() => loadTemplate(tpl)}
                    >
                      <div className="symbol symbol-40px me-3">
                        {tpl.backgroundImage ? (
                          <img src={tpl.backgroundImage} alt="tpl" />
                        ) : (
                          <div className="symbol-label">CT</div>
                        )}
                      </div>
                      <div className="d-flex flex-column">
                        <span className="text-gray-800 fw-bold fs-7">
                          {tpl.name}
                        </span>
                        <span className="text-muted fs-9">
                          ID: {tpl.id.substring(0, 8)}...
                        </span>
                      </div>
                    </button>
                  ))}
                  {availableTemplates.length === 0 && (
                    <div className="p-5 text-center text-muted">
                      No templates found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default CertificateEditor;
