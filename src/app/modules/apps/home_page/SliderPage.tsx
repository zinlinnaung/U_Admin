import React, { useState, useEffect } from "react";
import { KTIcon } from "../../../../_metronic/helpers";
import { Modal } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";

type Slider = {
  id: string;
  image: string;
  createdAt?: string;
  updatedAt?: string;
};

// API base URL
const API_BASE_URL = "https://mypadminapi.bitmyanmar.info/api";

export const SliderPage: React.FC = () => {
  // -------------------
  // State
  // -------------------
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSlider, setEditingSlider] = useState<Slider | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    folder: "slider",
    isPublic: true,
  });

  // -------------------
  // API Calls
  // -------------------
  const fetchSliders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/home-slider`);
      setSliders(response.data);
    } catch (error) {
      console.error("Error fetching sliders:", error);
      toast.error("Failed to load sliders");
    } finally {
      setLoading(false);
    }
  };

  const createSlider = async (
    file: File,
    folder: string,
    isPublic: boolean
  ) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("image", file);
      formData.append("folder", folder);
      formData.append("isPublic", isPublic.toString());

      const response = await axios.post(
        `${API_BASE_URL}/home-slider`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Slider created successfully");
      fetchSliders();
      return response.data;
    } catch (error) {
      console.error("Error creating slider:", error);
      toast.error("Failed to create slider");
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const updateSlider = async (id: string, data: any) => {
    try {
      setUploading(true);
      const response = await axios.patch(
        `${API_BASE_URL}/home-slider/${id}`,
        data
      );
      toast.success("Slider updated successfully");
      fetchSliders();
      return response.data;
    } catch (error) {
      console.error("Error updating slider:", error);
      toast.error("Failed to update slider");
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const deleteSlider = async (id: string) => {
    try {
      if (window.confirm("Are you sure you want to delete this slider?")) {
        await axios.delete(`${API_BASE_URL}/home-slider/${id}`);
        toast.success("Slider deleted successfully");
        fetchSliders();
      }
    } catch (error) {
      console.error("Error deleting slider:", error);
      toast.error("Failed to delete slider");
    }
  };

  // -------------------
  // Effects
  // -------------------
  useEffect(() => {
    fetchSliders();
  }, []);

  // -------------------
  // Handlers
  // -------------------
  const handleEdit = (slider: Slider) => {
    setEditingSlider(slider);
    setPreview(slider.image);
    setFile(null); // Reset file when editing
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    await deleteSlider(id);
  };

  const handleAdd = () => {
    setEditingSlider(null);
    setPreview(null);
    setFile(null);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingSlider) {
        // Update existing slider
        const updateData: any = {};

        // If there's a new image, convert to base64 with data URL format
        if (file) {
          const base64Image = await convertFileToBase64(file);
          updateData.image = base64Image; // This should be in data:image/jpeg;base64,... format
        }

        await updateSlider(editingSlider.id, updateData);
        setShowModal(false);
        resetForm();
      } else {
        // Create new slider
        if (!file) {
          toast.error("Please select an image");
          return;
        }

        await createSlider(file, formData.folder, formData.isPublic);
        setShowModal(false);
        resetForm();
      }
    } catch (error) {
      console.error("Error saving slider:", error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // The result will be in data:image/[type];base64,[base64String] format
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const resetForm = () => {
    setEditingSlider(null);
    setPreview(null);
    setFile(null);
    setFormData({
      folder: "slider",
      isPublic: true,
    });
  };

  // -------------------
  // Render
  // -------------------
  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "50vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-8 shadow-sm m-10">
      <div className="d-flex justify-content-between align-items-center mb-6">
        <h2 className="fw-bold text-dark">Slider Management</h2>
        <button
          className="btn btn-primary"
          onClick={handleAdd}
          disabled={uploading}
        >
          {uploading ? (
            <span
              className="spinner-border spinner-border-sm me-2"
              role="status"
              aria-hidden="true"
            ></span>
          ) : (
            <KTIcon iconName="plus" className="fs-2" />
          )}
          Add Item
        </button>
      </div>

      <div className="table-responsive">
        <table className="table align-middle gs-0 gy-4">
          <thead>
            <tr className="fw-bold text-muted bg-light">
              <th className="min-w-100px">Image</th>
              <th className="min-w-150px">Created At</th>
              <th className="min-w-150px">Updated At</th>
              <th className="min-w-100px text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sliders.map((slider) => (
              <tr key={slider.id}>
                <td>
                  <img
                    src={slider.image}
                    alt="Slider"
                    className="w-100px h-60px rounded object-fit-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/media/illustrations/placeholder.png";
                    }}
                  />
                </td>
                <td>
                  {slider.createdAt
                    ? new Date(slider.createdAt).toLocaleDateString()
                    : "N/A"}
                </td>
                <td>
                  {slider.updatedAt
                    ? new Date(slider.updatedAt).toLocaleDateString()
                    : "N/A"}
                </td>
                <td className="text-end">
                  <button
                    className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-2"
                    onClick={() => handleEdit(slider)}
                    disabled={uploading}
                  >
                    <KTIcon iconName="pencil" className="fs-3" />
                  </button>
                  <button
                    className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm"
                    onClick={() => handleDelete(slider.id)}
                    disabled={uploading}
                  >
                    <KTIcon iconName="trash" className="fs-3" />
                  </button>
                </td>
              </tr>
            ))}
            {sliders.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-10">
                  <div className="text-muted">
                    No sliders found. Click "Add Item" to create one.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal
        show={showModal}
        onHide={() => !uploading && setShowModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editingSlider ? "Edit Slider" : "Add Slider"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <form id="sliderForm" onSubmit={handleSave}>
            {/* Image Upload */}
            <div className="mb-4 text-center">
              <div className="image-input image-input-outline">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-250px h-150px rounded mb-3 object-fit-cover"
                  />
                ) : (
                  <div
                    className="border rounded p-10 text-muted d-flex align-items-center justify-content-center"
                    style={{
                      width: "250px",
                      height: "150px",
                      margin: "0 auto",
                    }}
                  >
                    No image selected
                  </div>
                )}
              </div>
              <input
                type="file"
                name="image"
                accept="image/*"
                className="form-control mt-3"
                onChange={handleImageUpload}
                disabled={uploading}
                required={!editingSlider}
              />
              {editingSlider && !file && (
                <div className="text-muted mt-2">
                  <small>
                    Current image will be kept if no new image is selected
                  </small>
                </div>
              )}
            </div>

            {!editingSlider && (
              <div className="row mb-4">
                <div className="col-md-6">
                  <label className="form-label">Folder</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.folder}
                    onChange={(e) =>
                      setFormData({ ...formData, folder: e.target.value })
                    }
                    disabled={uploading}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Visibility</label>
                  <select
                    className="form-select"
                    value={formData.isPublic.toString()}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isPublic: e.target.value === "true",
                      })
                    }
                    disabled={uploading}
                  >
                    <option value="true">Public</option>
                    <option value="false">Private</option>
                  </select>
                </div>
              </div>
            )}

            <div className="text-end">
              <button
                type="button"
                className="btn btn-light me-3"
                onClick={() => setShowModal(false)}
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default SliderPage;
