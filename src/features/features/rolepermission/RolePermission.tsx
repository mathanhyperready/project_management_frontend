import React, { useState, useEffect } from "react";
import { Plus, MoreVertical, X, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { rolesAPI } from "../../../api/roles.api";

interface Permission {
  id: number;
  name: string;
  code: string;
  description: string | null;
}

interface Role {
  id: number;
  name: string;
  is_enabled: boolean;
  created_at: string;
  permissions: Permission[];
}

interface PermissionWithRoles extends Permission {
  roles: string[]; // Array of role names that have this permission
}

const RolePermission: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [allPermissions, setAllPermissions] = useState<PermissionWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<PermissionWithRoles | null>(null);
  const [showMenuId, setShowMenuId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal form state for role assignment
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  // Fetch roles and permissions from backend
  useEffect(() => {
    fetchRolesAndPermissions();
  }, []);

  const fetchRolesAndPermissions = async () => {
    try {
      setLoading(true);
      const response = await rolesAPI.getRoles();
      console.log("Fetched roles response:", response);
      
      // Handle both paginated and non-paginated responses
      const rolesData = response.results || response;
      console.log("Roles data:", rolesData);
      setRoles(Array.isArray(rolesData) ? rolesData : []);

      // Extract all unique permissions and map which roles have them
      const permissionsMap = new Map<number, PermissionWithRoles>();

      if (Array.isArray(rolesData)) {
        rolesData.forEach((role: Role) => {
          if (role.is_enabled && role.permissions) {
            role.permissions.forEach((perm) => {
              if (!permissionsMap.has(perm.id)) {
                permissionsMap.set(perm.id, {
                  ...perm,
                  roles: [],
                });
              }
              permissionsMap.get(perm.id)?.roles.push(role.name);
            });
          }
        });
      }

      const permissionsArray = Array.from(permissionsMap.values());
      console.log("Processed permissions:", permissionsArray);
      setAllPermissions(permissionsArray);
    } catch (error) {
      console.error("Failed to fetch roles and permissions:", error);
      alert("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle view/edit permission roles
  const handleViewPermission = (permission: PermissionWithRoles) => {
    setSelectedPermission(permission);
    
    // Get role IDs that have this permission
    const roleIds = roles
      .filter((role) => permission.roles.includes(role.name))
      .map((role) => role.id);
    
    setSelectedRoles(roleIds);
    setShowModal(true);
    setShowMenuId(null);
  };

  // Handle role checkbox toggle
  const handleRoleToggle = (roleId: number) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  // Handle save role assignments
  const handleSave = async () => {
    if (!selectedPermission) return;

    try {
      setSaving(true);
      
      // Update each role's permissions
      for (const role of roles) {
        const currentPermissionIds = role.permissions.map(p => p.id);
        let updatedPermissionIds = [...currentPermissionIds];

        if (selectedRoles.includes(role.id)) {
          // Add permission if not already present
          if (!updatedPermissionIds.includes(selectedPermission.id)) {
            updatedPermissionIds.push(selectedPermission.id);
          }
        } else {
          // Remove permission if present
          updatedPermissionIds = updatedPermissionIds.filter(
            id => id !== selectedPermission.id
          );
        }

        // Only update if there's a change
        if (JSON.stringify(currentPermissionIds.sort()) !== 
            JSON.stringify(updatedPermissionIds.sort())) {
          console.log(`Updating role ${role.name} (ID: ${role.id}) with permissions:`, updatedPermissionIds);
          await rolesAPI.updateRolePermissions(role.id, updatedPermissionIds);
        }
      }

      // Refresh data to reflect changes in sidebar
      await fetchRolesAndPermissions();
      
      // Trigger a custom event to update sidebar
      window.dispatchEvent(new Event('permissionsUpdated'));
      
      setShowModal(false);
      alert("Permission assignments updated successfully! The sidebar will update automatically.");
    } catch (error) {
      console.error("Failed to update permission assignments:", error);
      alert("Failed to update assignments. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Filter permissions
  const filteredPermissions = allPermissions.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.roles.some((role) => role.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Pagination calculations
  const totalItems = filteredPermissions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPermissions = filteredPermissions.slice(startIndex, endIndex);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Handle items per page change
  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowMenuId(null);
    if (showMenuId) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showMenuId]);

  if (loading) {
    return (
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="p-6">
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading permissions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm" style={{ maxHeight: "calc(100vh - 120px)" }}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Role Permissions</h2>
              <p className="text-sm text-gray-500 mt-1">
                Manage which roles have access to each permission. Changes update sidebar visibility automatically.
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-6 border-b flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search permissions by name, code, or assigned roles..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Permission Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Assigned Roles
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-20">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentPermissions.map((permission) => (
                  <tr key={permission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {permission.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <code className="px-2 py-1 bg-gray-100 rounded text-xs">
                        {permission.code}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {permission.description || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-wrap gap-1">
                        {permission.roles.length > 0 ? (
                          permission.roles.map((role, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                            >
                              {role}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-xs">No roles assigned</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleViewPermission(permission)}
                        className="p-1 hover:bg-gray-100 rounded text-cyan-600 hover:text-cyan-700"
                        title="Manage role access"
                      >
                        <Pencil size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredPermissions.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No permissions found
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredPermissions.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t bg-white flex-shrink-0">
              {/* Left side - Showing info and items per page */}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>
                  Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} permissions
                </span>
                <div className="flex items-center gap-2">
                  <span>Items per page:</span>
                  <select
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                    className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>

              {/* Right side - Pagination controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`flex items-center gap-1 px-3 py-1 rounded border ${
                    currentPage === 1
                      ? "border-gray-200 text-gray-400 cursor-not-allowed"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, current page, and pages around current
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-8 h-8 rounded ${
                            currentPage === page
                              ? "bg-cyan-400 text-white"
                              : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <span key={page} className="px-2 text-gray-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`flex items-center gap-1 px-3 py-1 rounded border ${
                    currentPage === totalPages
                      ? "border-gray-200 text-gray-400 cursor-not-allowed"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Role Assignment Modal */}
      {showModal && selectedPermission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Manage Role Access
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedPermission.name} ({selectedPermission.code})
                  </p>
                  <p className="text-xs text-blue-600 mt-2">
                    ℹ️ Checking "{selectedPermission.code}" will show the "{selectedPermission.code.split('_')[0]}" page in sidebar
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={saving}
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Select which roles should have this permission:
              </p>
              
              <div className="space-y-3">
                {roles.map((role) => (
                  <label
                    key={role.id}
                    className={`flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedRoles.includes(role.id) ? 'bg-blue-50 border-blue-300' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(role.id)}
                      onChange={() => handleRoleToggle(role.id)}
                      disabled={saving}
                      className="h-4 w-4 text-cyan-400 focus:ring-cyan-400 border-gray-300 rounded"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">
                          {role.name}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            role.is_enabled
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {role.is_enabled ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {role.permissions.length} permission(s) assigned
                      </p>
                    </div>
                  </label>
                ))}
              </div>

              {roles.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No roles available
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={saving}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-cyan-400 text-white rounded-lg hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolePermission;