"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import axios from "axios";

// --- Configuration ---
const BASE_API_URL = "https://mypadminapi.bitmyanmar.info/api";

// --- Types ---
type Activity = {
  id: string;
  name: string;
  order: number;
  sectionId: string;
  type: string;
};
type Category = {
  order: number;
  id: string;
  title: string;
  activities: Activity[];
};
// ----------------------------------------------------

// --- Utility Functions ---

const createSectionApi = async (
  courseId: string,
  title: string,
  order: number
) => {
  try {
    const response = await axios.post(`${BASE_API_URL}/course-sections`, {
      courseId: courseId,
      title: title,
      description: "",
      order: order,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to create new section:", error);
    throw new Error("Section creation failed");
  }
};

const patchSectionApi = async (sectionId: string, payload: any) => {
  try {
    await axios.patch(`${BASE_API_URL}/course-sections/${sectionId}`, payload);
  } catch (error) {
    console.error(`Failed to patch section ${sectionId}:`, error);
    throw new Error("Section update failed");
  }
};

const patchActivityOrder = async (activity: {
  id: string;
  order: number;
  sectionId: string;
}) => {
  try {
    await axios.patch(`${BASE_API_URL}/activities/${activity.id}`, {
      order: activity.order,
      sectionId: activity.sectionId,
    });
  } catch (error) {
    console.error(`Failed to patch activity ${activity.id}:`, error);
    throw new Error("Patch failed");
  }
};

const deleteSectionApi = async (sectionId: string) => {
  try {
    await axios.delete(`${BASE_API_URL}/course-sections/${sectionId}`);
  } catch (error) {
    console.error(`Failed to delete section ${sectionId}:`, error);
    throw new Error("Section deletion failed");
  }
};

const deleteActivityApi = async (activityId: string) => {
  try {
    await axios.delete(`${BASE_API_URL}/activities/${activityId}`);
  } catch (error) {
    console.error(`Failed to delete activity ${activityId}:`, error);
    throw new Error("Activity deletion failed");
  }
};
// ------------------------------------------------------------

const CourseCategoryList: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const courseId = searchParams.get("id");

  const [categories, setCategories] = useState<Category[]>([]);
  const [courseName, setCourseName] = useState<string>("");

  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );
  const [editingActivityId, setEditingActivityId] = useState<string | null>(
    null
  );
  const [tempTitle, setTempTitle] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [isCreatingSection, setIsCreatingSection] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingTitle, setIsSavingTitle] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      const res = await axios.get(`${BASE_API_URL}/courses/${courseId}`);
      const data = res.data;

      setCourseName(data.name || "Course Details");

      const mappedCategories: Category[] = (data.CourseSection || [])
        .map((sec: any) => ({
          id: sec.id,
          title: sec.title,
          order: sec.order || 0,
          activities: (sec.activities || [])
            .map((act: any) => ({
              id: act.id,
              name: act.title,
              order: act.order || 0,
              sectionId: sec.id,
              type: act.type,
            }))
            .sort((a: Activity, b: Activity) => a.order - b.order),
        }))
        .sort((a: Category, b: Category) => a.order - b.order); // Sort sections by order

      setCategories(mappedCategories);
    } catch (err) {
      console.error("Failed to fetch course sections:", err);
    }
  };

  const handleTitleEdit = (id: string, title: string) => {
    setEditingCategoryId(id);
    setTempTitle(title);
  };

  const handleTitleSave = async (id: string) => {
    if (tempTitle.trim() === "") {
      alert("Section title cannot be empty.");
      setEditingCategoryId(null);
      return;
    }

    const originalTitle = categories.find((cat) => cat.id === id)?.title || "";
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, title: tempTitle } : cat))
    );
    setEditingCategoryId(null);

    setIsSavingTitle(true);
    try {
      await patchSectionApi(id, { title: tempTitle });
    } catch (e) {
      alert("Failed to save title. Reverting...");
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === id ? { ...cat, title: originalTitle } : cat
        )
      );
    } finally {
      setIsSavingTitle(false);
    }
  };

  const handleActivitySave = async (catId: string, actId: string) => {
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

  const handleAddCategory = async () => {
    if (isCreatingSection || !courseId) return;
    setIsCreatingSection(true);
    const newOrder = categories.length + 1;

    try {
      const newSection = await createSectionApi(
        courseId,
        "New Section",
        newOrder
      );
      const newCategory: Category = {
        id: newSection.id,
        title: newSection.title || "New Section",
        activities: [],
        order: newSection.order || newOrder,
      };
      setCategories((prev) => [...prev, newCategory]);
      setEditingCategoryId(newSection.id);
      setTempTitle(newSection.title || "New Section");
    } catch (err) {
      alert("Failed to create new section.");
    } finally {
      setIsCreatingSection(false);
    }
  };

  const handleAddActivity = async (sectionId: string) => {
    if (isCreating) return;
    setIsCreating(true);
    try {
      const section = categories.find((c) => c.id === sectionId);
      const newOrder = section ? section.activities.length + 1 : 1;
      const res = await axios.post(`${BASE_API_URL}/activities`, {
        title: "New Activity",
        type: "PAGE",
        content: "",
        order: newOrder,
        sectionId: sectionId,
        description: "",
      });

      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === sectionId
            ? {
                ...cat,
                activities: [
                  ...cat.activities,
                  {
                    id: res.data.id,
                    name: res.data.title,
                    order: res.data.order,
                    sectionId: sectionId,
                    type: res.data.type,
                  },
                ].sort((a, b) => a.order - b.order),
              }
            : cat
        )
      );
    } catch (err) {
      alert("Failed to create activity.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!window.confirm("Delete this section and all activities?")) return;
    setIsDeleting(true);
    try {
      await deleteSectionApi(categoryId);
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    } catch (e) {
      alert("Delete failed.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteActivity = async (
    categoryId: string,
    activityId: string
  ) => {
    if (!window.confirm("Delete this activity?")) return;
    setIsDeleting(true);
    try {
      await deleteActivityApi(activityId);
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === categoryId
            ? {
                ...cat,
                activities: cat.activities
                  .filter((act) => act.id !== activityId)
                  .map((act, index) => ({ ...act, order: index + 1 })),
              }
            : cat
        )
      );
    } catch (e) {
      alert("Delete failed.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, type } = result;
    if (!destination || isOrdering) return;

    // --- 1. SECTION REORDERING ---
    if (type === "category") {
      const reordered = Array.from(categories);
      const [removed] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, removed);

      const toPatch: { id: string; order: number }[] = [];
      const finalSections = reordered.map((sec, index) => {
        const newOrder = index + 1;
        if (sec.order !== newOrder) {
          toPatch.push({ id: sec.id, order: newOrder });
        }
        return { ...sec, order: newOrder };
      });

      setCategories(finalSections);

      if (toPatch.length > 0) {
        setIsOrdering(true);
        try {
          await Promise.all(
            toPatch.map((sec) => patchSectionApi(sec.id, { order: sec.order }))
          );
        } catch (e) {
          alert("Failed to save section order. Reverting...");
          fetchCourseData();
        } finally {
          setIsOrdering(false);
        }
      }
      return;
    }

    // --- 2. ACTIVITY REORDERING ---
    const sourceIdx = categories.findIndex((c) => c.id === source.droppableId);
    const destIdx = categories.findIndex(
      (c) => c.id === destination.droppableId
    );
    if (sourceIdx === -1 || destIdx === -1) return;

    const updated = [...categories];
    const activitiesToPatch: any[] = [];

    if (sourceIdx === destIdx) {
      const items = Array.from(updated[sourceIdx].activities);
      const [removed] = items.splice(source.index, 1);
      items.splice(destination.index, 0, removed);
      updated[sourceIdx].activities = items.map((act, idx) => {
        const newOrder = idx + 1;
        if (act.order !== newOrder)
          activitiesToPatch.push({
            id: act.id,
            order: newOrder,
            sectionId: updated[sourceIdx].id,
          });
        return { ...act, order: newOrder };
      });
    } else {
      const sItems = Array.from(updated[sourceIdx].activities);
      const [moved] = sItems.splice(source.index, 1);
      const dItems = Array.from(updated[destIdx].activities);
      dItems.splice(destination.index, 0, moved);

      updated[sourceIdx].activities = sItems.map((a, i) => ({
        ...a,
        order: i + 1,
      }));
      updated[destIdx].activities = dItems.map((a, i) => ({
        ...a,
        order: i + 1,
        sectionId: updated[destIdx].id,
      }));

      updated[sourceIdx].activities.forEach((a) => activitiesToPatch.push(a));
      updated[destIdx].activities.forEach((a) => activitiesToPatch.push(a));
    }

    setCategories(updated);
    setIsOrdering(true);
    try {
      await Promise.all(activitiesToPatch.map((a) => patchActivityOrder(a)));
    } catch (e) {
      alert("Failed to save activity order.");
      fetchCourseData();
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <div className="container py-6">
      <h1 className="fw-bolder mb-2 text-dark">
        {courseName || "Loading Course..."}
      </h1>
      <h2 className="fw-bold mb-6 text-muted fs-3">
        Course Sections and Activities
      </h2>

      {(isOrdering || isDeleting || isCreatingSection || isSavingTitle) && (
        <div className="alert alert-info d-flex align-items-center mb-4 p-3">
          <div className="spinner-border spinner-border-sm me-3"></div>
          <strong>Processing...</strong>
        </div>
      )}

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
                              {category.order}. {category.title}
                            </h3>
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-sm btn-light"
                                onClick={() =>
                                  handleTitleEdit(category.id, category.title)
                                }
                              >
                                <i className="bi bi-pencil-square text-primary"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-light-danger"
                                onClick={() =>
                                  handleDeleteCategory(category.id)
                                }
                              >
                                <i className="bi bi-trash-fill text-danger"></i>
                              </button>
                            </div>
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
                                      <span className="badge badge-light-secondary fw-bold me-2">
                                        {act.order}
                                      </span>
                                      <span className="badge badge-light-info fw-bold me-2 text-uppercase">
                                        {act.type}
                                      </span>
                                      <span className="fw-semibold text-gray-800">
                                        {act.name}
                                      </span>
                                    </div>
                                    <div className="d-flex gap-2">
                                      <button
                                        className="btn btn-sm btn-light p-1"
                                        onClick={() =>
                                          navigate(
                                            `/apps/course/activity?id=${courseId}&activityId=${act.id}`
                                          )
                                        }
                                      >
                                        <i className="bi bi-pencil-square text-primary"></i>
                                      </button>
                                      <button
                                        className="btn btn-sm btn-light-danger p-1"
                                        onClick={() =>
                                          handleDeleteActivity(
                                            category.id,
                                            act.id
                                          )
                                        }
                                      >
                                        <i className="bi bi-trash-fill text-danger"></i>
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
                              disabled={isCreating}
                            >
                              {isCreating ? "Creating..." : "+ Add Activity"}
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
                disabled={isCreatingSection}
              >
                {isCreatingSection ? "Creating..." : "+ Add New Section"}
              </button>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default CourseCategoryList;
