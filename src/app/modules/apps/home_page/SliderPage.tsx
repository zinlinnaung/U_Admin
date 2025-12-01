import React, { useState, useEffect } from "react";
import axios, { AxiosResponse } from "axios";
import { KTIcon } from "../../../../_metronic/helpers";
import { Modal } from "react-bootstrap";

const API = "https://mypadminapi.bitmyanmar.info/api/home-slider";

type Slider = {
  id: string;
  image: string;
  isPublic: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export const SliderPage: React.FC = () => {
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSlider, setEditingSlider] = useState<Slider | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPublic, setIsPublic] = useState<boolean>(true);

  useEffect(() => {
    axios
      .get(API)
      .then((res) => setSliders(res.data))
      .catch((err) => console.error("Failed to load sliders:", err));
  }, []);

  const handleEdit = (slider: Slider) => {
    setEditingSlider(slider);
    setPreview(slider.image);
    setIsPublic(slider.isPublic);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingSlider(null);
    setPreview(null);
    setSelectedFile(null);
    setIsPublic(true);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API}/${id}`);
      setSliders(sliders.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile && !editingSlider) {
      alert("Please select an image");
      return;
    }

    try {
      let res;

      if (editingSlider) {
        // Editing: use PATCH with optional base64 image
        const payload: any = { isPublic };
        if (selectedFile) {
          const base64 = await fileToBase64(selectedFile);
          payload.image = base64;
        }
        res = await axios.patch(`${API}/${editingSlider.id}`, payload);
        setSliders(
          sliders.map((s) => (s.id === editingSlider.id ? res.data : s))
        );
      } else {
        // Adding: use POST with multipart/form-data
        const formData = new FormData();
        formData.append("folder", "slider");
        formData.append("isPublic", isPublic.toString());
        formData.append("image", selectedFile!);

        res = await axios.post(API, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSliders([...sliders, res.data]);
      }

      // Reset modal state
      setShowModal(false);
      setPreview(null);
      setSelectedFile(null);
      setEditingSlider(null);
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  // Helper function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="card p-8 shadow-sm m-10">
      <div className="d-flex justify-content-between align-items-center mb-6">
        <h2 className="fw-bold text-dark">Slider Management</h2>
        <button className="btn btn-primary" onClick={handleAdd}>
          <KTIcon iconName="plus" className="fs-2" /> Add Item
        </button>
      </div>

      <div className="table-responsive">
        <table className="table align-middle gs-0 gy-4">
          <thead>
            <tr className="fw-bold text-muted bg-light">
              <th className="min-w-100px">Image</th>
              <th className="min-w-100px">Public</th>
              <th className="min-w-150px">Created At</th>
              <th className="min-w-150px">Updated At</th>
              <th className="text-end min-w-100px">Actions</th>
            </tr>
          </thead>

          <tbody>
            {sliders.map((slider) => (
              <tr key={slider.id}>
                <td className="d-flex align-items-center">
                  <img
                    src={slider.image}
                    alt="slider"
                    className="w-150px h-80px rounded object-fit-cover me-3"
                  />
                </td>

                <td>{slider.isPublic ? "Yes" : "No"}</td>

                <td>
                  {slider.createdAt
                    ? new Date(slider.createdAt).toLocaleString()
                    : "-"}
                </td>

                <td>
                  {slider.updatedAt
                    ? new Date(slider.updatedAt).toLocaleString()
                    : "-"}
                </td>

                <td className="text-end">
                  <button
                    className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-2"
                    onClick={() => handleEdit(slider)}
                  >
                    <KTIcon iconName="pencil" className="fs-3" />
                  </button>

                  <button
                    className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm"
                    onClick={() => handleDelete(slider.id)}
                  >
                    <KTIcon iconName="trash" className="fs-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
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
            <div className="mb-3 text-center">
              <label className="form-label">Public?</label>
              <div>
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />{" "}
                Make Public
              </div>
            </div>

            <div className="mb-4 text-center">
              <div className="image-input image-input-outline">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-250px h-150px rounded mb-3 object-fit-cover"
                  />
                ) : (
                  <div className="border rounded p-10 text-muted">
                    No image selected
                  </div>
                )}
              </div>

              <input
                type="file"
                accept="image/*"
                className="form-control mt-3"
                onChange={handleImageUpload}
              />
            </div>

            <div className="text-end">
              <button
                type="button"
                className="btn btn-light me-3"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default SliderPage;
