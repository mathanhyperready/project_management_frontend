import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageContainer } from '../../../components/layout/PageContainer';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/Select';
import { Spinner } from '../../../components/ui/Spinner';
import { usePagination } from '../../../hooks/usePagination';
import { useFilters } from '../../../hooks/useFilters';
import { projectsAPI } from '../../../api/projects.api';
import type { Project, ProjectFilters as ProjectFiltersType } from '../../../utils/types';
import { formatDate } from '../../../utils/formatters';

const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const { filters, updateFilter } = useFilters<ProjectFiltersType & { page: number; limit: number }>({
    search: '',
    status: '',
    page: 1,
    limit: 10,
  });

  const pagination = usePagination({
    totalItems: totalCount,
    pageSize: filters.limit,
    initialPage: filters.page,
  });

  useEffect(() => {
    // loadProjects();
  }, [filters]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await projectsAPI.getProjects(filters);
      setProjects(response.data);
      setTotalCount(response.total);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    updateFilter('search', value);
    updateFilter('page', 1);
  };

  const handleStatusChange = (status: string) => {
    updateFilter('status', status);
    updateFilter('page', 1);
  };

  const handlePageChange = (page: number) => {
    updateFilter('page', page);
    pagination.goToPage(page);
  };

  return (
    <PageContainer
      title="Projects"
      actions={
        <Link to="/projects/new">
          <Button variant="primary">Create Project</Button>
        </Link>
      }
    >
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <h3 className="text-lg font-medium text-gray-900">All Projects</h3>
            <div className="flex gap-4 w-full sm:w-auto">
              <Input
                placeholder="Search projects..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full sm:w-64"
              />
              <Select
                value={filters.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                options={[
                  { value: '', label: 'All Status' },
                  { value: 'active', label: 'Active' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'on_hold', label: 'On Hold' },
                ]}
                className="w-full sm:w-40"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Spinner size="lg" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Start Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        End Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Members
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {projects.map((project) => (
                      <tr key={project.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <Link
                              to={`/projects/${project.id}`}
                              className="text-sm font-medium text-primary-600 hover:text-primary-900"
                            >
                              {project.name}
                            </Link>
                            <p className="text-sm text-gray-500 truncate max-w-xs">
                              {project.description}
                            </p>
                          </div>
                        </td>
                        {/* <td className="px-6 py-4 whitespace-nowrap"> */}
                          {/* <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              PROJECT_STATUS[project.status].color
                            } text-white`}
                          >
                            {PROJECT_STATUS[project.status].label}
                          </span> */}
                        {/* </td> */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(project.startDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(project.endDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {project.members.length} members
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            to={`/projects/${project.id}`}
                            className="text-primary-600 hover:text-primary-900 mr-4"
                          >
                            View
                          </Link>
                          <Link
                            to={`/tasks?projectId=${project.id}`}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Tasks
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {projects.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No projects found.</p>
                  <Link to="/projects/new" className="text-primary-600 hover:text-primary-500 mt-2 inline-block">
                    Create your first project
                  </Link>
                </div>
              )}

              {/* Pagination */}
              {totalCount > 0 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-700">
                    Showing {((filters.page - 1) * filters.limit) + 1} to{' '}
                    {Math.min(filters.page * filters.limit, totalCount)} of {totalCount} results
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={!pagination.hasPrevPage}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default ProjectList;