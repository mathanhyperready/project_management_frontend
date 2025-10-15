import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageContainer } from '../../../components/layout/PageContainer';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { useFormState } from '../../../hooks/useFormState';
import { projectsAPI } from '../../../api/projects.api';
import type { Project } from '../../../utils/types';
import { validateProject } from '../../../utils/validators';

const ProjectForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const { formData, errors, updateField, setError, setFormData } = useFormState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'active' as Project['status'],
    members: [] as string[],
  });

  useEffect(() => {
    if (id) {
      loadProject();
      setIsEditing(true);
    }
  }, [id]);

  const loadProject = async () => {
    try {
      const project = await projectsAPI.getProjectById(id!);
      setFormData({
        name: project.name,
        description: project.description,
        startDate: project.startDate.split('T')[0],
        endDate: project.endDate.split('T')[0],
        status: project.status,
        members: project.members,
      });
    } catch (error) {
      console.error('Failed to load project:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateProject(formData);
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => {
        // Map validation errors to fields (simplified)
        if (error.includes('name')) setError('name', error);
        else if (error.includes('description')) setError('description', error);
        else if (error.includes('start date')) setError('startDate', error);
        else if (error.includes('end date')) setError('endDate', error);
      });
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        await projectsAPI.updateProject(id!, formData);
      } 
    //   else {
    //     await projectsAPI.createProject(formData);
    //   }
      navigate('/projects');
    } catch (error: any) {
      console.error('Failed to save project:', error);
      setError('name', error.response?.data?.message || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer title={isEditing ? 'Edit Project' : 'Create Project'}>
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">
            {isEditing ? 'Edit Project' : 'Create New Project'}
          </h3>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            <Input
              label="Project Name"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              error={errors.name}
              required
              placeholder="Enter project name"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
                <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter project description"
                required
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) => updateField('startDate', e.target.value)}
                error={errors.startDate}
                required
              />

              <Input
                label="End Date"
                type="date"
                value={formData.endDate}
                onChange={(e) => updateField('endDate', e.target.value)}
                error={errors.endDate}
                required
              />
            </div>

            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => updateField('status', e.target.value as Project['status'])}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'completed', label: 'Completed' },
                { value: 'on_hold', label: 'On Hold' },
              ]}
            />

            <div className="flex justify-end space-x-4 pt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/projects')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={loading}
              >
                {isEditing ? 'Update Project' : 'Create Project'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default ProjectForm;