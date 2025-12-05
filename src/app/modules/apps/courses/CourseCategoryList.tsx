"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

type Activity = { id: string; name: string };
type Category = { id: string; title: string; activities: Activity[] };

const CourseCategoryList: React.FC = () => {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get("id"); // Get courseId from URL query

  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );
  const [editingActivityId, setEditingActivityId] = useState<string | null>(
    null
  );
  const [tempTitle, setTempTitle] = useState<string>("");

  // Fetch course sections when courseId is available
  useEffect(() => {
    if (!courseId) return;

    const fetchCourse = async () => {
      try {
        const res = await fetch(
          `https://mypadminapi.bitmyanmar.info/api/courses/${courseId}`
        );
        const data = await res.json();

        // Map API CourseSection to your local Category structure including activities
        const mappedCategories: Category[] = (data.CourseSection || []).map(
          (sec: any) => ({
            id: sec.id,
            title: sec.title,
            activities: (sec.activities || []).map((act: any) => ({
              id: act.id,
              name: act.title, // map title from API to name
            })),
          })
        );
        setCategories(mappedCategories);
      } catch (err) {
        console.error("Failed to fetch course sections:", err);
      }
    };

    fetchCourse();
  }, [courseId]);

  // --- Handlers for editing / adding / saving ---
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

  const handleAddCategory = () => {
    setCategories((prev) => [
      ...prev,
      { id: `cat-${Date.now()}`, title: "New Section", activities: [] },
    ]);
  };

  const handleAddActivity = (catId: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === catId
          ? {
              ...cat,
              activities: [
                ...cat.activities,
                { id: `act-${Date.now()}`, name: "New Activity" },
              ],
            }
          : cat
      )
    );
  };

  // --- Drag and Drop ---
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
      const items = Array.from(updated[sourceCatIndex].activities);
      const [removed] = items.splice(source.index, 1);
      items.splice(destination.index, 0, removed);
      updated[sourceCatIndex].activities = items;
    } else {
      const sourceItems = Array.from(updated[sourceCatIndex].activities);
      const [moved] = sourceItems.splice(source.index, 1);
      const destItems = Array.from(updated[destCatIndex].activities);
      destItems.splice(destination.index, 0, moved);

      updated[sourceCatIndex].activities = sourceItems;
      updated[destCatIndex].activities = destItems;
    }

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
                    <div
                      ref={provCat.innerRef}
                      {...provCat.draggableProps}
                      {...provCat.dragHandleProps}
                      className={`card card-flush mb-6 shadow-sm border ${
                        snapshotCat.isDragging ? "bg-light-primary" : ""
                      }`}
                    >
                      <div className="card-header bg-light px-5 py-3 border-bottom d-flex justify-content-between align-items-center">
                        {editingCategoryId === category.id ? (
                          <div className="d-flex gap-2 w-100">
                            <input
                              value={tempTitle}
                              onChange={(e) => setTempTitle(e.target.value)}
                              className="form-control"
                              autoFocus
                              onKeyDown={(e) =>
                                e.key === "Enter" &&
                                handleTitleSave(category.id)
                              }
                            />
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleTitleSave(category.id)}
                            >
                              <i className="bi bi-check-lg"></i>
                            </button>
                          </div>
                        ) : (
                          <div className="d-flex justify-content-between w-100">
                            <h3 className="card-title fw-bold fs-4 text-dark mb-0">
                              {category.title}
                            </h3>
                            <button
                              className="btn btn-sm btn-light"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTitleEdit(category.id, category.title);
                              }}
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
                              backgroundColor: snapshotList.isDraggingOver
                                ? "#f8fbff"
                                : "white",
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
                                    {...provAct.dragHandleProps}
                                    className={`d-flex align-items-center justify-content-between border rounded p-3 mb-2 bg-light cursor-pointer ${
                                      snapshotAct.isDragging
                                        ? "shadow-sm bg-light-primary"
                                        : ""
                                    }`}
                                  >
                                    <div className="d-flex align-items-center gap-3">
                                      {editingActivityId === act.id ? (
                                        <input
                                          value={tempTitle}
                                          onChange={(e) =>
                                            setTempTitle(e.target.value)
                                          }
                                          className="form-control"
                                          autoFocus
                                          onKeyDown={(e) =>
                                            e.key === "Enter" &&
                                            handleActivitySave(
                                              category.id,
                                              act.id
                                            )
                                          }
                                          onBlur={() =>
                                            handleActivitySave(
                                              category.id,
                                              act.id
                                            )
                                          }
                                          style={{ minWidth: 150 }}
                                        />
                                      ) : (
                                        <span className="fw-semibold text-gray-800">
                                          {act.name}
                                        </span>
                                      )}

                                      {!editingActivityId && (
                                        <button
                                          className="btn btn-sm btn-light p-1"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleActivityEdit(
                                              act.id,
                                              act.name
                                            );
                                          }}
                                        >
                                          <i className="bi bi-pencil-square text-primary"></i>
                                        </button>
                                      )}

                                      <button
                                        className="btn btn-sm btn-light p-1"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          // Updated Routing Logic
                                          // We pass both course ID and the specific activity ID
                                          const targetUrl = `/apps/course/activity?id=${courseId}&activityId=${act.id}`;
                                          window.location.href = targetUrl;
                                          // Note: In a real React app, prefer: navigate(targetUrl) using useNavigate() hook
                                        }}
                                      >
                                        <i className="bi bi-box-arrow-up-right text-info"></i>
                                      </button>
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
