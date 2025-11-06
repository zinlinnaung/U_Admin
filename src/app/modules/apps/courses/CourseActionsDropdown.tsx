import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

type Props = {
  courseId?: number;
  courseTitle?: string;
  onDelete: (id?: number) => void;
  onEdit?: (id?: number) => void;
};

export const CourseActionsDropdown: React.FC<Props> = ({
  courseId,
  courseTitle,
  onDelete,
  onEdit,
}) => {
  const [open, setOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-detect if dropdown should open upward or downward
  useEffect(() => {
    if (open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = 140; // estimate
      setOpenUpward(spaceBelow < dropdownHeight && spaceAbove > dropdownHeight);
    }
  }, [open]);

  return (
    <div className="position-relative d-inline-block" ref={ref}>
      {/* Action Button */}
      <button
        className="btn btn-sm btn-light d-flex align-items-center gap-1"
        onClick={() => setOpen((prev) => !prev)}
      >
        Actions
        <i
          className={`bi ${open ? "bi-caret-up-fill" : "bi-caret-down-fill"}`}
        ></i>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="dropdown-menu show p-2 shadow"
          style={{
            position: "absolute",
            top: openUpward ? "auto" : "100%",
            bottom: openUpward ? "100%" : "auto",
            transform: openUpward ? "translateY(-4px)" : "translateY(4px)",
            left: 0,
            minWidth: "160px",
            zIndex: 1050,
          }}
        >
          <button
            className="dropdown-item d-flex align-items-center"
            onClick={() => {
              onEdit?.(courseId);
              setOpen(false);
            }}
          >
            <i className="bi bi-pencil-square me-2"></i> Edit
          </button>

          <button
            className="dropdown-item d-flex align-items-center"
            onClick={() => {
              onDelete(courseId);
              setOpen(false);
            }}
          >
            <i className="bi bi-trash me-2"></i> Delete
          </button>

          <button
            className="dropdown-item d-flex align-items-center"
            onClick={() => {
              navigate("/apps/category");
              setOpen(false);
            }}
          >
            <i className="bi bi-list-ul me-2"></i> Sections
          </button>
        </div>
      )}
    </div>
  );
};
