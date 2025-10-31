import React, { useState, useEffect } from "react";
import { Plus, MoreVertical, X, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";

interface Permission {
  id: number;
  name: string;
  code: string;
  description: string;
  status: "Active" | "Inactive";
  created_at?: string;
}

const RolePermission: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([
    {
      id: 1,
      name: "Project Create",
      code: "project_create",
      description: "Allows user to create new projects",
      status: "Active",
    },
    {
      id: 2,
      name: "Project Edit",
      code: "project_edit",
      description: "Allows user to edit existing projects",
      status: "Active",
    },
    {
      id: 3,
      name: "Project Delete",
      code: "project_delete",
      description: "Allows user to delete projects",
      status: "Inactive",
    },
    {
      id: 4,
      name: "User View",
      code: "user_view",
      description: "Allows user to view user list",
      status: "Active",
    },
    {
      id: 5,
      name: "User Create",
      code: "user_create",
      description: "Allows user to create new users",
      status: "Active",
    },
    {
      id: 6,
      name: "User Edit",
      code: "user_edit",
      description: "Allows user to edit existing users",
      status: "Active",
    },
    {
      id: 7,
      name: "User Delete",
      code: "user_delete",
      description: "Allows user to delete users",
      status: "Inactive",
    },
    {
      id: 8,
      name: "Role View",
      code: "role_view",
      description: "Allows user to view roles",
      status: "Active",
    },
    {
      id: 9,
      name: "Role Create",
      code: "role_create",
      description: "Allows user to create new roles",
      status: "Active",
    },
    {
      id: 10,
      name: "Role Edit",
      code: "role_edit",
      description: "Allows user to edit existing roles",
      status: "Active",
    },
    {
      id: 11,
      name: "Role Delete",
      code: "role_delete",
      description: "Allows user to delete roles",
      status: "Inactive",
    },
    {
      id: 12,
      name: "Client View",
      code: "client_view",
      description: "Allows user to view clients",
      status: "Active",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPermission, setCurrentPermission] = useState<Permission | null>(null);
  const [showMenuId, setShowMenuId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    status: "Active" as "Active" | "Inactive",
  });

  // Handle create
  const handleCreate = () => {
    setIsEditMode(false);
    setFormData({
      name: "",
      code: "",
      description: "",
      status: "Active",
    });
    setShowModal(true);
  };

  // Handle edit
  const handleEdit = (permission: Permission) => {
    setIsEditMode(true);
    setCurrentPermission(permission);
    setFormData({
      name: permission.name,
      code: permission.code,
      description: permission.description,
      status: permission.status,
    });
    setShowModal(true);
    setShowMenuId(null);
  };

  // Handle delete
  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this permission?")) {
      setPermissions(permissions.filter((p) => p.id !== id));
      setShowMenuId(null);
    }
  };

  // Handle save
  const handleSave = () => {
    if (!formData.name || !formData.code) {
      alert("Name and Code are required");
      return;
    }

    if (isEditMode && currentPermission) {
      // Update existing permission
      setPermissions(
        permissions.map((p) =>
          p.id === currentPermission.id
            ? { ...p, ...formData }
            : p
        )
      );
    } else {
      // Create new permission
      const newPermission: Permission = {
        id: Date.now(),
        ...formData,
        created_at: new Date().toISOString(),
      };
      setPermissions([...permissions, newPermission]);
    }

    setShowModal(false);
    setFormData({
      name: "",
      code: "",
      description: "",
      status: "Active",
    });
  };

  // Handle input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Auto-generate code from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const code = name
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
    setFormData((prev) => ({ ...prev, name, code }));
  };

  // Filter permissions
  const filteredPermissions = permissions.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
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

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm" style={{ maxHeight: "calc(100vh - 120px)" }}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
            <h2 className="text-xl font-semibold text-gray-900">Role Permissions</h2>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-400 text-white rounded font-medium hover:bg-cyan-500 transition-colors"
            >
              <Plus size={20} />
              Create Permission
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-6 border-b flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search permissions..."
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
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
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
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          permission.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {permission.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="relative inline-block">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowMenuId(showMenuId === permission.id ? null : permission.id);
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <MoreVertical size={18} className="text-gray-600" />
                        </button>

                        {showMenuId === permission.id && (
                          <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                            <button
                              onClick={() => handleEdit(permission)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Pencil size={16} />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(permission.id)}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 size={16} />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditMode ? "Edit Permission" : "Create Permission"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="e.g., Project Create"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  required
                />
              </div>

              {/* Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="e.g., project_create"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 font-mono text-sm"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Auto-generated from name. Use lowercase with underscores.
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter permission description..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-cyan-400 text-white rounded-lg hover:bg-cyan-500"
              >
                {isEditMode ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolePermission;