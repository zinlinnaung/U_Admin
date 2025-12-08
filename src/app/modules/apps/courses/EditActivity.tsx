import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { KTCard, KTCardBody } from "../../../../_metronic/helpers";
import { Form, Button, Spinner, Alert } from "react-bootstrap";
import { QuillEditor } from "./QuillEditor";
import axios from "axios"; // Ensure axios is installed: npm install axios

// --- 1. DEFINE ACTIVITY TYPE ENUM ---
enum ActivityType {
  PDF_FILE = "PDF_FILE",
  VIDEO_FILE = "VIDEO_FILE",
  H5P = "H5P",
  WEB_URL = "WEB_URL",
  YOUTUBE_LINK = "YOUTUBE_LINK",
  PAGE = "PAGE",
}

// Map frontend Enum to Backend Object/String logic if necessary
// Based on your requirements, the API expects a specific format.
// We will handle this in the payload generation.

export const EditActivity = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // IDs from URL
  const courseId = searchParams.get("id");
  const activityId = searchParams.get("activityId");

  // Loading & Error States
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form States
  const [name, setName] = useState("");
  const [type, setType] = useState<ActivityType>(ActivityType.PAGE);
  const [externalUrl, setExternalUrl] = useState("");
  const [sectionId, setSectionId] = useState(""); // Need to preserve this for the update
  const [activityOrder, setActivityOrder] = useState(0); // Need to preserve this

  // STATE FOR EDITOR
  const [descriptionContent, setDescriptionContent] = useState("");
  const [pageContent, setPageContent] = useState("");

  // Helper: Detect type based on API response data
  const determineTypeFromApi = (act: any): ActivityType => {
    const rawType = act.type; // This might be an object or string based on schema
    // Since the API definition for type says "{}", we need to be careful.
    // Assuming 'type' in DB usually maps to your Enum logic or string.

    // For now, let's look at the content or a type string if it exists
    // If your backend returns type as a string "PAGE", "VIDEO", etc:
    const typeStr = (
      typeof rawType === "string" ? rawType : rawType?.name || ""
    ).toUpperCase();

    if (typeStr === "PAGE") return ActivityType.PAGE;
    if (typeStr === "H5P") return ActivityType.H5P;

    // Fallback logic based on content if type isn't explicit
    if (act.content) {
      if (
        act.content.includes("youtube.com") ||
        act.content.includes("youtu.be")
      ) {
        return ActivityType.YOUTUBE_LINK;
      }
      if (act.content.endsWith(".pdf")) {
        return ActivityType.PDF_FILE;
      }
    }

    // Default
    return ActivityType.PAGE;
  };

  // --- 3. Fetch Data ---
  useEffect(() => {
    if (!courseId || !activityId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Course Data to find the section and activity
        // Note: Providing the courseId to get the structure is good,
        // but if there is a direct endpoint for single activity, use that.
        // Based on your provided code, you fetch the course to find the activity.
        const res = await axios.get(
          `https://mypadminapi.bitmyanmar.info/api/courses/${courseId}`
        );
        const data = res.data;

        let foundActivity: any = null;
        let foundSectionId: string = "";

        if (data.CourseSection && Array.isArray(data.CourseSection)) {
          for (const section of data.CourseSection) {
            const match = section.activities?.find(
              (act: any) => act.id === activityId
            );
            if (match) {
              foundActivity = match;
              foundSectionId = section.id;
              break;
            }
          }
        }

        if (foundActivity) {
          setName(foundActivity.title);
          setSectionId(foundSectionId);
          setActivityOrder(foundActivity.order || 0);

          // Determine Type
          const mappedType = determineTypeFromApi(foundActivity);
          setType(mappedType);

          // Set Description
          setDescriptionContent(foundActivity.description || "");

          // Set Content
          const content = foundActivity.content || "";

          if (mappedType === ActivityType.PAGE) {
            setPageContent(content);
          } else if (
            mappedType === ActivityType.WEB_URL ||
            mappedType === ActivityType.YOUTUBE_LINK
          ) {
            setExternalUrl(content);
          }
          // For Files, we usually don't set a "value" in a file input, so we leave it empty or show a label.
        } else {
          setError("Activity not found in this course.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load activity details.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, activityId]);

  // --- 4. Handle Save ---
  // --- 4. Handle Save ---
  const handleSave = async (redirect: boolean) => {
    if (!name) {
      alert("Name is required");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Prepare Content based on Type
      let finalContent = "";

      switch (type) {
        case ActivityType.PAGE:
          finalContent = pageContent;
          break;
        case ActivityType.WEB_URL:
        case ActivityType.YOUTUBE_LINK:
          finalContent = externalUrl;
          break;
        case ActivityType.PDF_FILE:
        case ActivityType.VIDEO_FILE:
        case ActivityType.H5P:
          // Keep existing content if no new file logic is implemented yet
          // or map to the file URL if you have one.
          finalContent = pageContent;
          break;
        default:
          finalContent = "";
      }

      // 2. Construct Payload
      const payload = {
        title: name,
        // FIX: Send the string directly (e.g., "PAGE"), NOT an object.
        type: type,
        content: finalContent,
        order: activityOrder, // Ensure this is a number
        sectionId: sectionId, // Ensure this is the valid UUID string
        description: descriptionContent,
      };

      console.log("Sending Payload:", payload); // Debugging

      // 3. Call API (PUT)
      await axios.patch(
        `https://mypadminapi.bitmyanmar.info/api/activities/${activityId}`,
        payload
      );

      if (redirect) {
        navigate(-1); // Go back
      } else {
        alert("Saved successfully!");
      }
    } catch (err: any) {
      console.error("API Error:", err);
      // Show the exact error message from backend if available
      const apiMessage =
        err.response?.data?.message || "Failed to save activity.";
      alert(
        `Error: ${
          Array.isArray(apiMessage) ? apiMessage.join(", ") : apiMessage
        }`
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center p-10">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger m-5">{error}</div>;
  }

  return (
    <KTCard className="m-3">
      <KTCardBody>
        <Form>
          {/* NAME */}
          <Form.Group className="mb-5">
            <Form.Label className="required fw-bold fs-6">Name</Form.Label>
            <Form.Control
              placeholder="Enter activity name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Form.Group>

          {/* DESCRIPTION */}
          <Form.Group className="mb-5">
            <Form.Label className="fw-bold fs-6">Description</Form.Label>
            <div className="border rounded p-2" style={{ borderRadius: "8px" }}>
              <QuillEditor
                value={descriptionContent}
                onChange={setDescriptionContent}
                height={180}
              />
            </div>
          </Form.Group>

          {/* TYPE SELECT */}
          <Form.Group className="mb-5">
            <Form.Label className="required fw-bold fs-6">Type</Form.Label>
            <Form.Select
              value={type}
              onChange={(e) => setType(e.target.value as ActivityType)}
            >
              <option value={ActivityType.PAGE}>Page</option>
              <option value={ActivityType.PDF_FILE}>PDF File</option>
              <option value={ActivityType.VIDEO_FILE}>Video File</option>
              <option value={ActivityType.H5P}>H5P</option>
              <option value={ActivityType.WEB_URL}>Web URL</option>
              <option value={ActivityType.YOUTUBE_LINK}>YouTube Link</option>
            </Form.Select>
          </Form.Group>

          {/* --- TYPE SPECIFIC FIELDS --- */}

          {/* PDF / VIDEO FILE */}
          {(type === ActivityType.PDF_FILE ||
            type === ActivityType.VIDEO_FILE) && (
            <Form.Group className="mb-5">
              <Form.Label className="fw-bold fs-6">
                Upload{" "}
                {type === ActivityType.PDF_FILE ? "PDF File" : "Video File"}
              </Form.Label>
              <div className="p-4 border rounded bg-light">
                <Form.Control
                  type="file"
                  accept={type === ActivityType.PDF_FILE ? ".pdf" : "video/*"}
                  // Logic to handle file upload to S3 and setPageContent(url) would go here
                  onChange={(e) => {
                    alert(
                      "File upload logic needs S3 integration implemented here."
                    );
                  }}
                />
                {pageContent && !pageContent.startsWith("<") && (
                  <div className="mt-2 text-primary">
                    Current file:{" "}
                    <a href={pageContent} target="_blank" rel="noreferrer">
                      View File
                    </a>
                  </div>
                )}
              </div>
            </Form.Group>
          )}

          {/* H5P */}
          {type === ActivityType.H5P && (
            <Form.Group className="mb-5">
              <Form.Label className="required fw-bold fs-6">
                Package file
              </Form.Label>
              <div className="p-4 border rounded bg-light">
                <Form.Control type="file" accept=".h5p" />
              </div>
            </Form.Group>
          )}

          {/* PAGE */}
          {type === ActivityType.PAGE && (
            <Form.Group className="mb-5">
              <Form.Label className="fw-bold fs-6">Page content</Form.Label>
              <div
                className="border rounded p-2"
                style={{ borderRadius: "8px" }}
              >
                <QuillEditor
                  value={pageContent}
                  onChange={setPageContent}
                  height={300}
                />
              </div>
            </Form.Group>
          )}

          {/* WEB URL / YOUTUBE */}
          {(type === ActivityType.WEB_URL ||
            type === ActivityType.YOUTUBE_LINK) && (
            <Form.Group className="mb-5">
              <Form.Label className="required fw-bold fs-6">
                {type === ActivityType.YOUTUBE_LINK
                  ? "YouTube Link"
                  : "Web URL"}
              </Form.Label>
              <Form.Control
                placeholder="https://..."
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
              />
            </Form.Group>
          )}

          {/* FOOTER BUTTONS */}
          <div className="d-flex gap-3 mt-10">
            <Button
              variant="primary"
              onClick={() => handleSave(true)}
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Save and return to course"}
            </Button>
            <Button
              variant="success"
              onClick={() => handleSave(false)}
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Save and stay"}
            </Button>
            <Button variant="danger" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </div>
        </Form>
      </KTCardBody>
    </KTCard>
  );
};
