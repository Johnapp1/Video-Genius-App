import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Video, 
  Search, 
  Plus, 
  MoreHorizontal, 
  Download, 
  Trash2,
  Grid3X3,
  List
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Project } from "@shared/schema";

interface ProjectsProps {
  onShowSection: (section: "create") => void;
  onShowResults: (projectId: string) => void;
}

export default function Projects({ onShowSection, onShowResults }: ProjectsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      await apiRequest("DELETE", `/api/projects/${projectId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project Deleted",
        description: "The project has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredProjects = projects?.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "in_progress":
        return "In Progress";
      case "draft":
        return "Draft";
      default:
        return "Unknown";
    }
  };

  const getWorkflowIcon = (workflow: string) => {
    return <Video className="text-primary" size={20} />;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} week${Math.ceil(diffDays / 7) > 1 ? 's' : ''} ago`;
    return `${Math.ceil(diffDays / 30)} month${Math.ceil(diffDays / 30) > 1 ? 's' : ''} ago`;
  };

  const handleDeleteProject = (projectId: string) => {
    if (window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      deleteProjectMutation.mutate(projectId);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">My Projects</h2>
            <p className="text-gray-600">Manage and organize all your content projects</p>
          </div>
          <Button 
            className="bg-primary text-white hover:bg-red-700 transition-colors"
            onClick={() => onShowSection("create")}
            data-testid="button-new-project"
          >
            <Plus className="mr-2" size={16} />
            New Project
          </Button>
        </div>

        {/* Filter and Search */}
        <Card className="border border-gray-200 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Input
                    placeholder="Search projects..."
                    className="pl-10 pr-4 py-2 border-2 border-red-500 focus:ring-red-500 focus:border-red-500 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    data-testid="input-search-projects"
                  />
                  <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="border-2 border-red-500 focus:ring-red-500 focus:border-red-500 w-48" data-testid="select-status-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`p-2 border-2 border-red-500 rounded-md ${viewMode === "grid" ? "bg-red-50 text-primary" : "text-gray-600 hover:text-primary"}`}
                  onClick={() => setViewMode("grid")}
                  data-testid="button-view-grid"
                >
                  <Grid3X3 size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`p-2 border-2 border-red-500 rounded-md ${viewMode === "list" ? "bg-red-50 text-primary" : "text-gray-600 hover:text-primary"}`}
                  onClick={() => setViewMode("list")}
                  data-testid="button-view-list"
                >
                  <List size={16} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects Display */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="border border-gray-200">
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-full"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <Card className="border border-gray-200">
            <CardContent className="p-12 text-center">
              <Video className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {projects?.length === 0 ? "No projects yet" : "No projects found"}
              </h3>
              <p className="text-gray-600 mb-4">
                {projects?.length === 0 
                  ? "Get started by creating your first video content package."
                  : "Try adjusting your search or filter criteria."
                }
              </p>
              {projects?.length === 0 && (
                <Button 
                  onClick={() => onShowSection("create")}
                  className="bg-primary text-white hover:bg-red-700"
                  data-testid="button-create-first-project"
                >
                  Create Your First Project
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {filteredProjects.map((project) => (
              <Card key={project.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      {getWorkflowIcon(project.workflow)}
                    </div>
                    <Button variant="ghost" size="icon" className="p-2 text-gray-400 hover:text-gray-600">
                      <MoreHorizontal size={16} />
                    </Button>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2" data-testid={`project-title-${project.id}`}>
                    {project.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4" data-testid={`project-description-${project.id}`}>
                    {project.description || "No description available"}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span 
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}
                      data-testid={`project-status-${project.id}`}
                    >
                      {getStatusText(project.status)}
                    </span>
                    <span className="text-sm text-gray-500" data-testid={`project-date-${project.id}`}>
                      {formatDate(project.createdAt!.toString())}
                    </span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      className="flex-1 bg-primary text-white hover:bg-red-700 transition-colors text-sm"
                      onClick={() => onShowResults(project.id)}
                      disabled={project.status !== "completed"}
                      data-testid={`button-view-project-${project.id}`}
                    >
                      {project.status === "completed" ? "View Project" : "In Progress"}
                    </Button>
                    <Button 
                      variant="ghost"
                      size="icon"
                      className="border-2 border-red-500 text-primary hover:bg-red-50 transition-colors"
                      disabled={project.status !== "completed"}
                      data-testid={`button-download-${project.id}`}
                    >
                      <Download size={16} />
                    </Button>
                    <Button 
                      variant="ghost"
                      size="icon"
                      className="border-2 border-red-500 text-primary hover:bg-red-50 transition-colors"
                      onClick={() => handleDeleteProject(project.id)}
                      disabled={deleteProjectMutation.isPending}
                      data-testid={`button-delete-${project.id}`}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
