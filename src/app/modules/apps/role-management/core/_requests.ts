import axios, { AxiosResponse } from "axios";
import { ID, Response } from "../../../../../_metronic/helpers";
import {
  Role,
  Permission,
  RolesQueryResponse,
  PermissionsQueryResponse,
  RoleWithPermissions,
} from "./_models";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";
const ROLE_URL = `${API_URL}/roles`;
const PERMISSION_URL = `${API_URL}/permissions`;

// ==================== ROLE REQUESTS ====================

// Get all roles
const getRoles = (query: string): Promise<RolesQueryResponse> => {
  return axios
    .get(`${ROLE_URL}?${query}`)
    .then((d: AxiosResponse<RolesQueryResponse>) => d.data);
};

// Get role by ID with permissions
const getRoleById = (id: ID): Promise<RoleWithPermissions | undefined> => {
  return axios
    .get(`${ROLE_URL}/${id}`)
    .then((response: AxiosResponse<Response<RoleWithPermissions>>) => response.data)
    .then((response: Response<RoleWithPermissions>) => response.data);
};

// Create role
const createRole = (role: Role): Promise<Role | undefined> => {
  return axios
    .post(ROLE_URL, role)
    .then((response: AxiosResponse<Response<Role>>) => response.data)
    .then((response: Response<Role>) => response.data);
};

// Update role
const updateRole = (role: Role): Promise<Role | undefined> => {
  return axios
    .put(`${ROLE_URL}/${role.id}`, role)
    .then((response: AxiosResponse<Response<Role>>) => response.data)
    .then((response: Response<Role>) => response.data);
};

// Delete role
const deleteRole = (roleId: ID): Promise<void> => {
  return axios.delete(`${ROLE_URL}/${roleId}`).then(() => {});
};

// Delete selected roles
const deleteSelectedRoles = (roleIds: Array<ID>): Promise<void> => {
  const requests = roleIds.map((id) => axios.delete(`${ROLE_URL}/${id}`));
  return axios.all(requests).then(() => {});
};

// Assign permissions to role
const assignPermissionsToRole = (
  roleId: ID,
  permissionIds: ID[]
): Promise<Role | undefined> => {
  return axios
    .post(`${ROLE_URL}/${roleId}/permissions`, { permissionIds })
    .then((response: AxiosResponse<Response<Role>>) => response.data)
    .then((response: Response<Role>) => response.data);
};

// Remove permission from role
const removePermissionFromRole = (
  roleId: ID,
  permissionId: ID
): Promise<void> => {
  return axios
    .delete(`${ROLE_URL}/${roleId}/permissions/${permissionId}`)
    .then(() => {});
};

// ==================== PERMISSION REQUESTS ====================

// Get all permissions
const getPermissions = (query: string): Promise<PermissionsQueryResponse> => {
  return axios
    .get(`${PERMISSION_URL}?${query}`)
    .then((d: AxiosResponse<PermissionsQueryResponse>) => d.data);
};

// Get all permissions (no pagination, for dropdown/checkboxes)
const getAllPermissions = (): Promise<Permission[]> => {
  return axios
    .get(`${PERMISSION_URL}/all`)
    .then((response: AxiosResponse<Response<Permission[]>>) => response.data)
    .then((response: Response<Permission[]>) => response.data || []);
};

// Get permission by ID
const getPermissionById = (id: ID): Promise<Permission | undefined> => {
  return axios
    .get(`${PERMISSION_URL}/${id}`)
    .then((response: AxiosResponse<Response<Permission>>) => response.data)
    .then((response: Response<Permission>) => response.data);
};

// Create permission
const createPermission = (
  permission: Permission
): Promise<Permission | undefined> => {
  return axios
    .post(PERMISSION_URL, permission)
    .then((response: AxiosResponse<Response<Permission>>) => response.data)
    .then((response: Response<Permission>) => response.data);
};

// Update permission
const updatePermission = (
  permission: Permission
): Promise<Permission | undefined> => {
  return axios
    .put(`${PERMISSION_URL}/${permission.id}`, permission)
    .then((response: AxiosResponse<Response<Permission>>) => response.data)
    .then((response: Response<Permission>) => response.data);
};

// Delete permission
const deletePermission = (permissionId: ID): Promise<void> => {
  return axios.delete(`${PERMISSION_URL}/${permissionId}`).then(() => {});
};

// Delete selected permissions
const deleteSelectedPermissions = (permissionIds: Array<ID>): Promise<void> => {
  const requests = permissionIds.map((id) =>
    axios.delete(`${PERMISSION_URL}/${id}`)
  );
  return axios.all(requests).then(() => {});
};

// Get permissions grouped by module
const getPermissionsByModule = (): Promise<{
  [module: string]: Permission[];
}> => {
  return axios
    .get(`${PERMISSION_URL}/grouped`)
    .then(
      (
        response: AxiosResponse
          Response<{ [module: string]: Permission[] }>
        >
      ) => response.data
    )
    .then(
      (response: Response<{ [module: string]: Permission[] }>) =>
        response.data || {}
    );
};

export {
  // Roles
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  deleteSelectedRoles,
  assignPermissionsToRole,
  removePermissionFromRole,

  // Permissions
  getPermissions,
  getAllPermissions,
  getPermissionById,
  createPermission,
  updatePermission,
  deletePermission,
  deleteSelectedPermissions,
  getPermissionsByModule,
};