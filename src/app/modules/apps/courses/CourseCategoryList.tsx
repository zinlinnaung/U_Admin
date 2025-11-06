"use client";

import React, { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

type Activity = { id: string; name: string };
type Category = { id: string; title: string; activities: Activity[] };

const CourseCategoryList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([
    {
      id: "cat-1",
      title: "Lesson 1 - Motherboard Introduction",
      activities: [
        { id: "act-1", name: "What is a Motherboard?" },
        { id: "act-2", name: "Motherboard Components Overview" },
        { id: "act-3", name: "Quiz - Motherboard Basics" },
      ],
    },
    {
      id: "cat-2",
      title: "Lesson 2 - Motherboard Form Factors",
      activities: [
        { id: "act-4", name: "Form Factor Overview" },
        { id: "act-5", name: "ATX vs Micro ATX vs Mini ITX" },
      ],
    },
  ]);

  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );
  const [editingActivityId, setEditingActivityId] = useState<string | null>(
    null
  );
  const [tempTitle, setTempTitle] = useState<string>("");

  const handleTitleEdit = (id: string, title: string) => {
    setEditingCategoryId(id);
    setTempTitle(title);
  };

  const handleTitleSave = (id: string) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, title: tempTitle } : cat))
    );
    setEditingCategoryId(null);
  };

  // ✅ Activity edit
  const handleActivityEdit = (id: string, name: string) => {
    setEditingActivityId(id);
    setTempTitle(name);
  };

  const handleActivitySave = (catId: string, actId: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === catId
          ? {
              ...cat,
              activities: cat.activities.map((act) =>
                act.id === actId ? { ...act, name: tempTitle } : act
              ),
            }
          : cat
      )
    );
    setEditingActivityId(null);
  };

  // ✅ Add new category
  const handleAddCategory = () => {
    const newId = `cat-${Date.now()}`;
    const newCategory: Category = {
      id: newId,
      title: `New Lesson`,
      activities: [],
    };
    setCategories((prev) => [...prev, newCategory]);
  };

  // ✅ Add new activity
  const handleAddActivity = (catId: string) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id === catId) {
          const newActivity: Activity = {
            id: `act-${Date.now()}`,
            name: `New Activity`,
          };
          return { ...cat, activities: [...cat.activities, newActivity] };
        }
        return cat;
      })
    );
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, type } = result;
    if (!destination) return;

    if (type === "category") {
      const reordered = Array.from(categories);
      const [removed] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, removed);
      setCategories(reordered);
      return;
    }

    const sourceCatIndex = categories.findIndex(
      (c) => c.id === source.droppableId
    );
    const destCatIndex = categories.findIndex(
      (c) => c.id === destination.droppableId
    );
    if (sourceCatIndex === -1 || destCatIndex === -1) return;

    const updated = [...categories];

    if (sourceCatIndex === destCatIndex) {
      const cat = updated[sourceCatIndex];
      const reordered = Array.from(cat.activities);
      const [removed] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, removed);
      updated[sourceCatIndex] = { ...cat, activities: reordered };
      setCategories(updated);
      return;
    }

    const sourceItems = Array.from(updated[sourceCatIndex].activities);
    const [moved] = sourceItems.splice(source.index, 1);
    const destItems = Array.from(updated[destCatIndex].activities);
    destItems.splice(destination.index, 0, moved);
    updated[sourceCatIndex] = {
      ...updated[sourceCatIndex],
      activities: sourceItems,
    };
    updated[destCatIndex] = {
      ...updated[destCatIndex],
      activities: destItems,
    };
    setCategories(updated);
  };

  return (
    <div className="container py-6">
      <h2 className="fw-bold mb-6">Course Sections and Activities</h2>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="all-categories" type="category">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {categories.map((category, catIndex) => (
                <Draggable
                  draggableId={category.id}
                  index={catIndex}
                  key={category.id}
                >
                  {(provCat, snapshotCat) => (
                    <div ref={provCat.innerRef} {...provCat.draggableProps}>
                      <div
                        className={`card card-flush mb-6 shadow-sm border border-gray-200 ${
                          snapshotCat.isDragging ? "bg-light-primary" : ""
                        }`}
                      >
                        <div
                          {...provCat.dragHandleProps}
                          className="card-header cursor-move bg-light px-5 py-3 border-bottom d-flex justify-content-between align-items-center"
                        >
                          {editingCategoryId === category.id ? (
                            <div className="d-flex align-items-center gap-2 w-100">
                              <input
                                type="text"
                                value={tempTitle}
                                onChange={(e) => setTempTitle(e.target.value)}
                                className="form-control"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === "Enter")
                                    handleTitleSave(category.id);
                                }}
                              />
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => handleTitleSave(category.id)}
                              >
                                <i className="bi bi-check-lg"></i>
                              </button>
                            </div>
                          ) : (
                            <div className="d-flex align-items-center justify-content-between w-100">
                              <h3 className="card-title fw-bold fs-4 text-dark mb-0">
                                {category.title}
                              </h3>
                              <button
                                className="btn btn-sm btn-light"
                                onClick={() =>
                                  handleTitleEdit(category.id, category.title)
                                }
                              >
                                <i className="bi bi-pencil-square text-primary"></i>
                              </button>
                            </div>
                          )}
                        </div>

                        <Droppable droppableId={category.id} type="activity">
                          {(provList, snapshotList) => (
                            <div
                              ref={provList.innerRef}
                              {...provList.droppableProps}
                              className="card-body bg-white py-4"
                              style={{
                                minHeight: 64,
                                background: snapshotList.isDraggingOver
                                  ? "#f8fbff"
                                  : "white",
                                transition: "background-color 0.15s ease",
                              }}
                            >
                              {category.activities.map((act, actIndex) => (
                                <Draggable
                                  key={act.id}
                                  draggableId={act.id}
                                  index={actIndex}
                                >
                                  {(provAct, snapshotAct) => (
                                    <div
                                      ref={provAct.innerRef}
                                      {...provAct.draggableProps}
                                      className={`d-flex align-items-center justify-content-between border rounded p-3 mb-2 bg-light cursor-pointer ${
                                        snapshotAct.isDragging
                                          ? "shadow-sm bg-light-primary"
                                          : ""
                                      }`}
                                    >
                                      <div className="d-flex align-items-center gap-2">
                                        {editingActivityId === act.id ? (
                                          <input
                                            type="text"
                                            value={tempTitle}
                                            onChange={(e) =>
                                              setTempTitle(e.target.value)
                                            }
                                            className="form-control"
                                            autoFocus
                                            onKeyDown={(e) => {
                                              if (e.key === "Enter")
                                                handleActivitySave(
                                                  category.id,
                                                  act.id
                                                );
                                            }}
                                            onBlur={() =>
                                              handleActivitySave(
                                                category.id,
                                                act.id
                                              )
                                            }
                                            style={{ minWidth: "150px" }}
                                          />
                                        ) : (
                                          <span className="fw-semibold text-gray-800">
                                            {act.name}
                                          </span>
                                        )}
                                        {!editingActivityId && (
                                          <button
                                            className="btn btn-sm btn-light p-1"
                                            onClick={() =>
                                              handleActivityEdit(
                                                act.id,
                                                act.name
                                              )
                                            }
                                          >
                                            <i className="bi bi-pencil-square text-primary"></i>
                                          </button>
                                        )}
                                      </div>

                                      {/* Drag handle stays on the right */}
                                      <div
                                        {...provAct.dragHandleProps}
                                        className="text-muted fs-7"
                                      >
                                        <i className="bi bi-grip-vertical"></i>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}

                              {provList.placeholder}
                              <button
                                className="btn btn-light-primary w-100 mt-3"
                                onClick={() => handleAddActivity(category.id)}
                              >
                                + Add Activity
                              </button>
                            </div>
                          )}
                        </Droppable>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}

              {provided.placeholder}

              <button
                className="btn btn-light-success w-100 mt-6"
                onClick={handleAddCategory}
              >
                + Add New Sections
              </button>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default CourseCategoryList;
