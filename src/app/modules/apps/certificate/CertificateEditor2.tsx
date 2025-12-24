import React, { useState, useRef, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom"; // Added useNavigate
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
      className={`card card-custom shadow-sm mb-4 cursor-move border border-hover-primary ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div className="card-body p-4 d-flex align-items-center">
        <div className="symbol symbol-40px me-3">
          <span className="symbol-label bg-light-primary">
            <KTIcon iconName={icon} className="fs-2 text-primary" />
          </span>
        </div>
        <div className="fw-bold text-gray-800 fs-7">{label}</div>
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
        opacity: isDragging ? 0.5 : 1,
        userSelect: "none",
        whiteSpace: "nowrap",
        zIndex: 10,
        backgroundColor: selected ? "rgba(0, 158, 247, 0.05)" : "transparent",
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
            borderRadius: "50%",
          }}
        >
          <KTIcon iconName="cross" className="fs-6 text-white" />
        </button>
      )}
    </div>
  );
};

// --- Main Editor ---
const CertificateEditor: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const certIdFromQuery = searchParams.get("id");

  const [templateName, setTemplateName] = useState("Certificate Template");
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [components, setComponents] = useState<ComponentData[]>([]);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(
    null
  );

  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_URL =
    "https://mypadminapi.bitmyanmar.info/api/certificate-templates";

  // --- 1. Load Data if editing existing ---
  useEffect(() => {
    if (certIdFromQuery) {
      fetchSingleTemplate(certIdFromQuery);
    }
  }, [certIdFromQuery]);

  const fetchSingleTemplate = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      const template: ApiTemplate = response.data;

      setTemplateName(template.name);
      setBackgroundImage(template.backgroundImage);

      const loadedComponents: ComponentData[] = template.components.data.map(
        (c) => ({
          id: c.id,
          type: c.type,
          position: c.position,
          value: c.type === "name" ? "Student Name" : "24/12/2025",
        })
      );
      setComponents(loadedComponents);
    } catch (error) {
      console.error("Failed to load template:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- 2. Save Logic (Update via PATCH or Create via POST) ---
  const handleSave = async () => {
    if (!backgroundImage) return alert("Please upload a background image.");
    setIsSaving(true);

    const payload = {
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
      if (certIdFromQuery) {
        // UPDATE (PATCH)
        await axios.patch(`${API_URL}/${certIdFromQuery}`, payload);
        alert("Template updated successfully!");
      } else {
        // CREATE (POST)
        const createPayload = { ...payload, id: `cert-${Date.now()}` };
        await axios.post(API_URL, createPayload);
        alert("Template saved successfully!");
      }
      navigate(-1); // Go back to list after success
    } catch (error) {
      alert("Failed to save template.");
    } finally {
      setIsSaving(false);
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
          value: item.type === "name" ? "Student Name" : "24/12/2025",
        };
        setComponents((prev) => [...prev, newComp]);
        setSelectedComponentId(newComp.id);
      }
    },
  }));

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

  if (isLoading)
    return (
      <div className="p-10 text-center fs-4 fw-bold">Loading Template...</div>
    );

  return (
    <DndProvider backend={HTML5Backend}>
      {/* Header Actions */}
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-5">
        <div className="d-flex align-items-center">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-sm btn-icon btn-light-primary me-3"
          >
            <KTIcon iconName="arrow-left" className="fs-2" />
          </button>
          <h1 className="text-dark fw-bold my-1 fs-3">
            {certIdFromQuery ? "Edit Template" : "Create New Template"}
          </h1>
        </div>
        <div className="d-flex gap-3">
          <button
            className="btn btn-sm btn-primary"
            onClick={handleSave}
            disabled={isSaving}
          >
            <KTIcon iconName="check" className="fs-3 me-1" />
            {isSaving
              ? "Saving..."
              : certIdFromQuery
              ? "Update Changes"
              : "Save Template"}
          </button>
          <button
            className="btn btn-sm btn-success"
            onClick={generatePDF}
            disabled={isGenerating}
          >
            <KTIcon iconName="file-up" className="fs-3 me-1" />
            {isGenerating ? "Processing..." : "Export PDF Preview"}
          </button>
        </div>
      </div>

      <div className="d-flex flex-column flex-lg-row">
        {/* LEFT PANEL */}
        <div className="w-lg-300px me-lg-5 mb-5">
          <div className="card shadow-sm mb-5">
            <div className="card-body p-5">
              <label className="form-label fw-bold">Template Name</label>
              <input
                className="form-control mb-5"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
              <button
                className="btn btn-outline btn-outline-dashed btn-outline-primary w-100"
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

          <div className="card shadow-sm">
            <div className="card-header min-h-auto py-3">
              <h3 className="card-title fs-6">Drag and Drop Fields</h3>
            </div>
            <div className="card-body p-5">
              <DraggableComponent
                type="name"
                label="Student Name"
                icon="user"
              />
              <DraggableComponent
                type="date"
                label="Issue Date"
                icon="calendar"
              />
            </div>
          </div>
        </div>

        {/* MIDDLE PANEL (Canvas) */}
        <div className="flex-lg-row-fluid mb-5">
          <div
            className="card shadow-sm bg-light-dark p-10 d-flex justify-content-center overflow-auto"
            style={{ minHeight: "650px" }}
          >
            <div
              ref={(el) => {
                (canvasRef as any).current = el;
                drop(el);
              }}
              className="position-relative bg-white shadow-lg"
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
                <div className="h-100 d-flex align-items-center justify-content-center text-gray-500">
                  <div className="text-center">
                    <KTIcon iconName="picture" className="fs-3x mb-3" />
                    <p>Upload a background image to begin designing</p>
                  </div>
                </div>
              )}
              {components.map((c) => (
                <PlacedComponent
                  key={c.id}
                  component={c}
                  selected={c.id === selectedComponentId}
                  onSelect={setSelectedComponentId}
                  onDelete={(id) =>
                    setComponents((prev) =>
                      prev.filter((item) => item.id !== id)
                    )
                  }
                />
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-lg-300px">
          <div className="card shadow-sm">
            <div className="card-header bg-primary py-3 min-h-auto">
              <h3 className="card-title fs-6 text-white">Properties</h3>
            </div>
            <div className="card-body p-5">
              {selectedComponentId ? (
                <div>
                  <label className="form-label fw-bold fs-8 text-muted uppercase">
                    Edit Preview Text
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
                    onClick={() => {
                      setComponents((prev) =>
                        prev.filter((c) => c.id !== selectedComponentId)
                      );
                      setSelectedComponentId(null);
                    }}
                  >
                    Remove Field
                  </button>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-10">
                  <KTIcon iconName="mouse-pointer" className="fs-2x mb-3" />
                  <p className="fs-7">
                    Select an element on the canvas to edit its properties
                  </p>
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
