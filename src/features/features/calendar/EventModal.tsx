import React, { useState, useEffect } from "react";
import moment from "moment";
import { X, MoreVertical } from "lucide-react";
import { calculateDuration } from "../../../utils/timeCalculations";
import { projectsAPI } from "../../../api/projects.api";
import type { EventType, Project } from "../../../utils/types";

interface EventModalProps {
  show: boolean;
  isEditMode: boolean;
  editingEvent: EventType | null;
  startTime: string;
  endTime: string;
  selectedDate: Date;
  description: string;
  project: string;
  tags: string;
  billable: boolean;
  onClose: () => void;
  onSave: () => void;
  onDelete: () => void;
  onDuplicate?: () => void;
  setStartTime: (time: string) => void;
  setEndTime: (time: string) => void;
  setSelectedDate: (date: Date) => void;
  setDescription: (desc: string) => void;
  setProject: (project: string) => void;
  setTags: (tags: string) => void;
  setBillable: (billable: boolean) => void;
}

export const EventModal: React.FC<EventModalProps> = ({
  show,
  isEditMode,
  startTime,
  endTime,
  selectedDate,
  description,
  project,
  tags,
  billable,
  onClose,
  onSave,
  onDelete,
  onDuplicate,
  setStartTime,
  setEndTime,
  setSelectedDate,
  setDescription,
  setProject,
  setTags,
  setBillable,
}) => {
  const [duration, setDuration] = useState("00:00:00");
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [projectList, setProjectList] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  useEffect(() => {
    setDuration(calculateDuration(startTime, endTime));
  }, [startTime, endTime]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoadingProjects(true);
        const data = await projectsAPI.getProjects();
        setProjectList(data);
      } catch (err) {
        console.error("❌ Failed to fetch projects:", err);
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjects();
  }, []);

  const handleTimeChange = (type: "start" | "end", value: string) => {
    if (type === "start") setStartTime(value);
    else setEndTime(value);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-medium text-gray-600">
            {isEditMode ? "Edit time entry" : "Add time entry"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Time and Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time and date
            </label>
            <div className="flex gap-3 items-center flex-wrap">
              <input
                type="text"
                value={duration}
                readOnly
                className="px-3 py-2 border rounded text-sm w-24 bg-gray-50"
              />
              <input
                type="time"
                value={startTime}
                onChange={(e) => handleTimeChange("start", e.target.value)}
                className="px-3 py-2 border rounded text-sm w-24"
              />
              <span className="text-gray-600">-</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => handleTimeChange("end", e.target.value)}
                className="px-3 py-2 border rounded text-sm w-24"
              />
              <input
                type="date"
                value={moment(selectedDate).format("YYYY-MM-DD")}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="px-3 py-2 border rounded text-sm w-36"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What have you worked on?"
              className="w-full px-3 py-2 border rounded text-sm min-h-20 resize-vertical"
            />
          </div>

          {/* Project Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project <span className="text-red-500">*</span>
            </label>
            <select
              value={project}
              onChange={(e) => setProject(e.target.value)}
              disabled={loadingProjects}
              className="w-full px-3 py-2 border rounded text-sm bg-white"
            >
              <option value="">Select Project</option>
              {loadingProjects ? (
                <option>Loading...</option>
              ) : projectList.length > 0 ? (
                projectList.map((p) => (
                  <option key={p.id} value={p.project_name}>
                    {p.project_name}
                  </option>
                ))
              ) : (
                <option>No projects found</option>
              )}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Add tags"
              className="w-full px-3 py-2 border rounded text-sm"
            />
          </div>

          {/* Billable */}
          <div>
            <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
              <span>Billable</span>
              <input
                type="checkbox"
                checked={billable}
                onChange={(e) => setBillable(e.target.checked)}
                className="w-5 h-5"
              />
              <span className="text-gray-600 font-normal">Yes</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex justify-between items-center">
          {isEditMode && (
            <div className="relative">
              <button
                onClick={() => setShowContextMenu(!showContextMenu)}
                className="p-2 text-gray-600 hover:text-gray-800"
              >
                <MoreVertical size={20} />
              </button>
              {showContextMenu && (
                <div className="absolute bottom-full left-0 mb-2 bg-white shadow-lg rounded min-w-[150px] z-10">
                  {onDuplicate && (
                    <button
                      onClick={() => {
                        onDuplicate();
                        setShowContextMenu(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Duplicate
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onDelete();
                      setShowContextMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-red-500 hover:bg-gray-50"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
          <div className="flex gap-3 ml-auto">
            <button
              onClick={onClose}
              className="px-6 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={!description || !project}
              className="px-6 py-2 text-sm bg-cyan-400 text-white rounded hover:bg-cyan-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isEditMode ? "SAVE" : "ADD"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
