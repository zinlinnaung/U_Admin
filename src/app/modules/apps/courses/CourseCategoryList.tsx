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
type Category = { id: string; title: string; activities: Activity[] };
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
      description: "", // Added default description field as required by your API body
      order: order,
    });
    // Return the new section data, which includes the database ID
    return response.data;
  } catch (error) {
    console.error("Failed to create new section:", error);
    throw new Error("Section creation failed");
  }
};

const patchSectionTitleApi = async (sectionId: string, newTitle: string) => {
  try {
    // CORRECTED: Using the confirmed PATCH endpoint /course-sections/{id}
    await axios.patch(`${BASE_API_URL}/course-sections/${sectionId}`, {
      title: newTitle,
    });
  } catch (error) {
    console.error(`Failed to patch section title for ${sectionId}:`, error);
    throw new Error("Section title update failed");
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
    // NOTE: Keeping the original DELETE endpoint as specified in your code's context
    await axios.delete(`${BASE_API_URL}/courses/sections/${sectionId}`);
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

  // Fetch course sections
  useEffect(() => {
    if (!courseId) return;
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      const res = await axios.get(`${BASE_API_URL}/courses/${courseId}`);
      const data = res.data;

      setCourseName(data.name || "Course Details");

      const mappedCategories: Category[] = (data.CourseSection || []).map(
        (sec: any) => ({
          id: sec.id,
          title: sec.title,
          activities: (sec.activities || [])
            .map((act: any) => ({
              id: act.id,
              name: act.title,
              order: act.order || 0,
              sectionId: sec.id,
              type: act.type,
            }))
            .sort((a: Activity, b: Activity) => a.order - b.order),
        })
      );
      setCategories(mappedCategories);
    } catch (err) {
      console.error("Failed to fetch course sections:", err);
    }
  };

  // --- Handlers for editing / saving ---
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

    const originalTitle =
      categories.find((cat) => cat.id === id)?.title || "Old Title";

    // 1. Optimistic Local State Update
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, title: tempTitle } : cat))
    );
    setEditingCategoryId(null);

    // 2. Database Update
    setIsSavingTitle(true);
    try {
      // CALLING THE CORRECTED API FUNCTION
      await patchSectionTitleApi(id, tempTitle);
      console.log(`Successfully updated section ${id} title to ${tempTitle}`);
    } catch (e) {
      alert(
        "Failed to save section title to the database. Reverting local change."
      );
      // Revert local state on failure
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === id ? { ...cat, title: originalTitle } : cat
        )
      );
    } finally {
      setIsSavingTitle(false);
    }
  };

  const handleActivityEdit = (id: string, name: string) => {
    setEditingActivityId(id);
    setTempTitle(name);
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
    // TODO: Add API call to update activity title
  };

  // --- handleAddCategory ---
  const handleAddCategory = async () => {
    if (isCreatingSection || !courseId) return;

    setIsCreatingSection(true);
    const defaultTitle = "New Section";
    const newOrder = categories.length + 1;

    try {
      const newSection = await createSectionApi(
        courseId,
        defaultTitle,
        newOrder
      );

      const newCategory: Category = {
        id: newSection.id,
        title: newSection.title || defaultTitle,
        activities: [],
      };

      setCategories((prev) => [...prev, newCategory]);
      setEditingCategoryId(newSection.id);
      setTempTitle(newSection.title || defaultTitle);
    } catch (err) {
      console.error("Failed to add new section:", err);
      alert("Failed to create new section on server.");
    } finally {
      setIsCreatingSection(false);
    }
  };
  // ---------------------------------------------------------------------

  // --- handleAddActivity ---
  const handleAddActivity = async (sectionId: string) => {
    if (isCreating) return;

    if (sectionId.startsWith("cat-")) {
      alert(
        "Error: Section ID is temporary. Please ensure the section was saved."
      );
      return;
    }

    setIsCreating(true);
    const defaultType = "PAGE";

    try {
      const section = categories.find((c) => c.id === sectionId);
      const newOrder = section ? section.activities.length + 1 : 1;

      const payload = {
        title: "New Activity",
        type: defaultType,
        content: "",
        order: newOrder,
        sectionId: sectionId,
        description: "",
      };

      const res = await axios.post(`${BASE_API_URL}/activities`, payload);

      const newActivityData = res.data;

      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === sectionId
            ? {
                ...cat,
                activities: [
                  ...cat.activities,
                  {
                    id: newActivityData.id,
                    name: newActivityData.title || "New Activity",
                    order: newActivityData.order || newOrder,
                    sectionId: sectionId,
                    type: newActivityData.type || defaultType,
                  },
                ].sort((a, b) => a.order - b.order),
              }
            : cat
        )
      );
    } catch (err) {
      console.error("Failed to create activity:", err);
      alert("Failed to create new activity on server.");
    } finally {
      setIsCreating(false);
    }
  };

  // --- Delete Handlers (REMAIN SAME) ---
  const handleDeleteCategory = async (categoryId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this section and ALL of its activities? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteSectionApi(categoryId);
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    } catch (e) {
      alert("Failed to delete the section on the server.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteActivity = async (
    categoryId: string,
    activityId: string
  ) => {
    if (!window.confirm("Are you sure you want to delete this activity?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteActivityApi(activityId);

      // Optimistic local state update
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === categoryId
            ? {
                ...cat,
                activities: cat.activities
                  .filter((act) => act.id !== activityId)
                  .map((act, index) => ({
                    ...act,
                    order: index + 1, // Recalculate and update local order
                  })),
              }
            : cat
        )
      );
    } catch (e) {
      alert("Failed to delete the activity on the server. Please refresh.");
      fetchCourseData(); // Re-fetch data on failure
    } finally {
      setIsDeleting(false);
    }
  };

  // --- Drag and Drop (REMAIN SAME) ---
  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, type } = result;
    if (!destination || isOrdering) return;

    if (type === "category") {
      const reordered = Array.from(categories);
      const [removed] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, removed);
      setCategories(reordered);
      // TODO: API call to save section order
      return;
    }

    // --- Activity Reordering ---

    const sourceCatIndex = categories.findIndex(
      (c) => c.id === source.droppableId
    );
    const destCatIndex = categories.findIndex(
      (c) => c.id === destination.droppableId
    );
    if (sourceCatIndex === -1 || destCatIndex === -1) return;

    const updated = [...categories];
    const activitiesToPatch: {
      id: string;
      order: number;
      sectionId: string;
    }[] = [];
    let sourceSectionId = updated[sourceCatIndex].id;
    let destSectionId = updated[destCatIndex].id;

    // 1. Perform the optimistic local state update
    if (sourceCatIndex === destCatIndex) {
      // Reordering within the same section
      const items = Array.from(updated[sourceCatIndex].activities);
      const [removed] = items.splice(source.index, 1);
      items.splice(destination.index, 0, removed);
      updated[sourceCatIndex].activities = items;
    } else {
      // Moving activity between sections
      const sourceItems = Array.from(updated[sourceCatIndex].activities);
      const [movedItem] = sourceItems.splice(source.index, 1);
      const destItems = Array.from(updated[destCatIndex].activities);
      destItems.splice(destination.index, 0, movedItem);

      updated[sourceCatIndex].activities = sourceItems;
      updated[destCatIndex].activities = destItems;
    }

    // 2. Calculate new orders and queue necessary PATCH requests

    // Process Source Section (if activity order changed or item was moved out)
    updated[sourceCatIndex].activities.forEach((activity, index) => {
      const newOrder = index + 1;
      // Queue patch if order changed OR if the activity belonged to a different section originally
      if (
        activity.order !== newOrder ||
        activity.sectionId !== sourceSectionId
      ) {
        activitiesToPatch.push({
          id: activity.id,
          order: newOrder,
          sectionId: sourceSectionId,
        });
      }
    });

    // Process Destination Section (if different from source)
    if (sourceCatIndex !== destCatIndex) {
      updated[destCatIndex].activities.forEach((activity, index) => {
        const newOrder = index + 1;
        // Queue patch if order changed OR if the activity belonged to a different section originally
        if (
          activity.order !== newOrder ||
          activity.sectionId !== destSectionId
        ) {
          activitiesToPatch.push({
            id: activity.id,
            order: newOrder,
            sectionId: destSectionId,
          });
        }
      });
    }

    // 3. Update local state with the final calculated orders and section IDs
    const finalCategories = updated.map((cat) => ({
      ...cat,
      activities: cat.activities.map((act, index) => ({
        ...act,
        order: index + 1,
        sectionId: cat.id, // Ensure local state sectionId is correct
      })),
    }));
    setCategories(finalCategories);

    // 4. Send PATCH requests to API
    if (activitiesToPatch.length === 0) return;

    setIsOrdering(true);
    try {
      const patchPromises = activitiesToPatch.map((activity) =>
        patchActivityOrder(activity)
      );
      await Promise.all(patchPromises);
      console.log(
        `Successfully patched ${activitiesToPatch.length} activities.`
      );
    } catch (e) {
      alert("Failed to save the new order. Reverting to last saved data.");
      fetchCourseData(); // Re-fetch data to revert state on failure
    } finally {
      setIsOrdering(false);
    }
  };
  // -------------------------------------------------------------------------

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
          <div
            className="spinner-border spinner-border-sm me-3"
            role="status"
          ></div>
          <strong>
            {isOrdering
              ? "Saving new order..."
              : isDeleting
              ? "Processing deletion..."
              : isSavingTitle
              ? "Saving title..."
              : "Creating new section..."}
          </strong>
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
                              disabled={isSavingTitle}
                            >
                              {isSavingTitle ? (
                                <span className="spinner-border spinner-border-sm"></span>
                              ) : (
                                <i className="bi bi-check-lg"></i>
                              )}
                            </button>
                          </div>
                        ) : (
                          <div className="d-flex justify-content-between w-100">
                            <h3 className="card-title fw-bold fs-4 text-dark mb-0">
                              {category.title}
                            </h3>
                            {/* --- Section Action Buttons --- */}
                            <div className="d-flex gap-2">
                              {/* EDIT Button */}
                              <button
                                className="btn btn-sm btn-light"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTitleEdit(category.id, category.title);
                                }}
                                disabled={isDeleting || isSavingTitle}
                              >
                                <i className="bi bi-pencil-square text-primary"></i>
                              </button>

                              {/* DELETE Button (NEW) */}
                              <button
                                className="btn btn-sm btn-light-danger"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCategory(category.id);
                                }}
                                disabled={
                                  isDeleting || isOrdering || isSavingTitle
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
                                      {/* Display the current order number */}
                                      <span className="badge badge-light-secondary fw-bold me-2">
                                        {act.order}
                                      </span>
                                      {/* Display the activity type (NEW) */}
                                      <span className="badge badge-light-info fw-bold me-2 text-uppercase">
                                        {act.type}
                                      </span>

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
                                    </div>

                                    {/* --- Activity Action Buttons --- */}
                                    <div className="d-flex gap-2">
                                      {/* LINK Button (for navigating to activity edit page) */}
                                      <button
                                        className="btn btn-sm btn-light p-1"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(
                                            `/apps/course/activity?id=${courseId}&activityId=${act.id}`
                                          );
                                        }}
                                        disabled={isDeleting}
                                      >
                                        <i className="bi bi-pencil-square text-primary"></i>
                                      </button>

                                      {/* DELETE Button */}
                                      <button
                                        className="btn btn-sm btn-light-danger p-1"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteActivity(
                                            category.id,
                                            act.id
                                          );
                                        }}
                                        disabled={isDeleting || isOrdering}
                                      >
                                        <i className="bi bi-trash-fill text-danger"></i>
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provList.placeholder}

                            {/* ADD ACTIVITY BUTTON */}
                            <button
                              className="btn btn-light-primary w-100 mt-3"
                              onClick={() => handleAddActivity(category.id)}
                              disabled={
                                isCreating || isDeleting || isCreatingSection
                              }
                            >
                              {isCreating ? (
                                <span>
                                  <span className="spinner-border spinner-border-sm me-2"></span>
                                  Creating Activity...
                                </span>
                              ) : (
                                "+ Add Activity"
                              )}
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
                disabled={isDeleting || isCreatingSection}
              >
                {isCreatingSection ? (
                  <span>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Creating Section...
                  </span>
                ) : (
                  "+ Add New Section"
                )}
              </button>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default CourseCategoryList;
