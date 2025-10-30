import { FC, useState, useEffect } from "react";
import clsx from "clsx";
import { ID } from "../../../../../../_metronic/helpers";
import { useQueryResponse } from "../core/QueryResponseProvider";
import { Role, Permission } from "../../core/_models";
import {
  createRole,
  getRoleById,
  updateRole,
  getAllPermissions,
} from "../../core/_requests";

type Props = {
  roleId?: ID;
  onClose: () => void;
};

const RoleEditModalForm: FC<Props> = ({ roleId, onClose }) => {
  const { refetch } = useQueryResponse();
  const [loading, setLoading] = useState(false);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [permissionsByModule, setPermissionsByModule] = useState<{
    [module: string]: Permission[];
  }>({});
  const [formData, setFormData] = useState<Role>({
    id: undefined,
    name: "",
    slug: "",
    description: "",
    permissions: [],
    permissionIds: [],
    userCount: 0,
    isSystemRole: false,
    status: "Active",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Load all permissions on mount
  useEffect(() => {
    setLoading(true);
    getAllPermissions()
      .then((permissions) => {
        setAllPermissions(permissions);

        // Group permissions by module
        const grouped = permissions.reduce((acc, permission) => {
          const module = permission.module || "Other";
          if (!acc[module]) {
            acc[module] = [];
          }
          acc[module].push(permission);
          return acc;
        }, {} as { [module: string]: Permission[] });

        setPermissionsByModule(grouped);
      })
      .catch((error) => console.error("Error loading permissions:", error))
      .finally(() => setLoading(false));
  }, []);

  // Load role data if editing
  useEffect(() => {
    if (roleId) {
      setLoading(true);
      getRoleById(roleId)
        .then((role) => {
          if (role) {
            setFormData((prev) => ({
              ...prev,
              ...role,
              permissionIds:
                (role.permissions?.map((p) => p.id).filter(Boolean) as ID[]) ||
                [],
            }));
          }
        })
        .catch((error) => console.error("❌ Error loading role:", error))
        .finally(() => setLoading(false));
    } else {
      setFormData({
        id: undefined,
        name: "",
        slug: "",
        description: "",
        permissions: [],
        permissionIds: [],
        userCount: 0,
        isSystemRole: false,
        status: "Active",
      });
    }
  }, [roleId]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    // Auto-generate slug from name
    if (name === "name") {
      const slug = value
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      setFormData((prev) => ({
        ...prev,
        name: value,
        slug: slug,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePermissionToggle = (permissionId: ID) => {
    setFormData((prev) => {
      const currentIds = prev.permissionIds || [];
      const isSelected = currentIds.includes(permissionId);

      return {
        ...prev,
        permissionIds: isSelected
          ? currentIds.filter((id) => id !== permissionId)
          : [...currentIds, permissionId],
      };
    });
  };

  const handleSelectAllInModule = (module: string, select: boolean) => {
    const modulePermissions = permissionsByModule[module] || [];
    const modulePermissionIds = modulePermissions
      .map((p) => p.id)
      .filter(Boolean) as ID[];

    setFormData((prev) => {
      const currentIds = prev.permissionIds || [];

      if (select) {
        // Add all module permissions that aren't already selected
        const newIds = [...currentIds];
        modulePermissionIds.forEach((id) => {
          if (!newIds.includes(id)) {
            newIds.push(id);
          }
        });
        return { ...prev, permissionIds: newIds };
      } else {
        // Remove all module permissions
        return {
          ...prev,
          permissionIds: currentIds.filter(
            (id) => !modulePermissionIds.includes(id)
          ),
        };
      }
    });
  };

  const isModuleFullySelected = (module: string): boolean => {
    const modulePermissions = permissionsByModule[module] || [];
    const modulePermissionIds = modulePermissions
      .map((p) => p.id)
      .filter(Boolean) as ID[];
    const currentIds = formData.permissionIds || [];

    return (
      modulePermissionIds.length > 0 &&
      modulePermissionIds.every((id) => currentIds.includes(id))
    );
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Role name is required";
    }

    if (!formData.slug?.trim()) {
      newErrors.slug = "Role slug is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (roleId) {
        await updateRole(formData);
        alert("Role updated successfully!");
      } else {
        await createRole(formData);
        alert("Role created successfully!");
      }

      await refetch();
      onClose();
    } catch (error) {
      console.error("❌ Error saving role:", error);
      alert("Error saving role. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && roleId) {
    return (
      <div className="text-center py-5">
        <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
        <span className="ms-2">Loading...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="mb-7">
        <h3 className="fw-bold text-dark mb-5">Role Information</h3>

        {/* Role Name */}
        <div className="fv-row mb-5">
          <label className="required fw-semibold fs-6 mb-2">Role Name</label>
          <input
            type="text"
            name="name"
            className={clsx("form-control form-control-solid", {
              "is-invalid": errors.name,
            })}
            placeholder="Enter role name (e.g., Content Manager)"
            value={formData.name || ""}
            onChange={handleInputChange}
            disabled={loading || formData.isSystemRole}
          />
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
        </div>

        {/* Role Slug */}
        <div className="fv-row mb-5">
          <label className="required fw-semibold fs-6 mb-2">Role Slug</label>
          <input
            type="text"
            name="slug"
            className={clsx("form-control form-control-solid", {
              "is-invalid": errors.slug,
            })}
            placeholder="Auto-generated from name"
            value={formData.slug || ""}
            onChange={handleInputChange}
            disabled={loading || formData.isSystemRole}
          />
          {errors.slug && <div className="invalid-feedback">{errors.slug}</div>}
          <div className="form-text">
            Lowercase letters, numbers, and hyphens only
          </div>
        </div>

        {/* Description */}
        <div className="fv-row mb-5">
          <label className="fw-semibold fs-6 mb-2">Description</label>
          <textarea
            name="description"
            className="form-control form-control-solid"
            rows={3}
            placeholder="Enter role description"
            value={formData.description || ""}
            onChange={handleInputChange}
            disabled={loading}
          />
        </div>

        {/* Status */}
        <div className="fv-row mb-7">
          <label className="fw-semibold fs-6 mb-2">Status</label>
          <select
            name="status"
            className="form-select form-select-solid"
            value={formData.status || "Active"}
            onChange={handleInputChange}
            disabled={loading}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {/* Permissions Section */}
        <div className="separator my-7"></div>

        <h4 className="fw-bold text-dark mb-5">Permissions</h4>
        <div className="text-muted mb-5">
          Select the permissions for this role. Users with this role will have
          access to the selected features.
        </div>

        {/* Permissions by Module */}
        <div className="permissions-wrapper">
          {Object.keys(permissionsByModule).map((module) => {
            const modulePermissions = permissionsByModule[module];
            const isFullySelected = isModuleFullySelected(module);

            return (
              <div key={module} className="mb-7">
                <div className="d-flex align-items-center mb-3">
                  <div className="form-check form-check-custom form-check-solid me-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={isFullySelected}
                      onChange={(e) =>
                        handleSelectAllInModule(module, e.target.checked)
                      }
                      id={`module-${module}`}
                    />
                  </div>
                  <label
                    className="fw-bold text-gray-800 fs-5 mb-0 cursor-pointer"
                    htmlFor={`module-${module}`}
                  >
                    {module}
                  </label>
                  <span className="badge badge-light-primary ms-2">
                    {modulePermissions.length} permissions
                  </span>
                </div>

                <div className="ms-10">
                  <div className="row">
                    {modulePermissions.map((permission) => (
                      <div key={permission.id} className="col-md-6 mb-3">
                        <div className="form-check form-check-custom form-check-solid">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={
                              formData.permissionIds?.includes(
                                permission.id!
                              ) || false
                            }
                            onChange={() =>
                              handlePermissionToggle(permission.id!)
                            }
                            id={`permission-${permission.id}`}
                          />
                          <label
                            className="form-check-label cursor-pointer"
                            htmlFor={`permission-${permission.id}`}
                          >
                            <div className="fw-semibold text-gray-800">
                              {permission.name}
                            </div>
                            {permission.description && (
                              <div className="text-muted fs-7">
                                {permission.description}
                              </div>
                            )}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {allPermissions.length === 0 && !loading && (
          <div className="alert alert-warning">
            No permissions available. Please create permissions first.
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="text-end pt-5">
        <button
          type="button"
          className="btn btn-light me-3"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {!loading && (roleId ? "Update Role" : "Create Role")}
          {loading && (
            <span className="indicator-progress" style={{ display: "block" }}>
              Please wait...
              <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
            </span>
          )}
        </button>
      </div>
    </form>
  );
};

export { RoleEditModalForm };
