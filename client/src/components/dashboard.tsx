import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Video, 
  FileText, 
  Calendar, 
  Star, 
  Wand2, 
  Upload, 
  LayoutTemplate,
  ExternalLink,
  MoreHorizontal 
} from "lucide-react";

interface DashboardProps {
  onShowSection: (section: "create" | "projects") => void;
}

interface UserStats {
  totalProjects: number;
  scriptsGenerated: number;
  thisMonth: number;
  avgRating: number;
}

interface Project {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  description?: string;
}

export default function Dashboard({ onShowSection }: DashboardProps) {
  const { data: stats, isLoading: statsLoading } = useQuery<UserStats>({
    queryKey: ["/api/user/stats"],
  });

  const { data: recentProjects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    select: (data: Project[]) => data.slice(0, 3), // Get only recent 3 projects
  });

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

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h2>
          <p className="text-gray-600">Ready to create amazing YouTube content with AI?</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Projects</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="stat-total-projects">
                    {statsLoading ? "..." : stats?.totalProjects || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Video className="text-secondary" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Scripts Generated</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="stat-scripts-generated">
                    {statsLoading ? "..." : stats?.scriptsGenerated || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <FileText className="text-primary" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="stat-this-month">
                    {statsLoading ? "..." : stats?.thisMonth || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Calendar className="text-green-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Rating</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="stat-avg-rating">
                    {statsLoading ? "..." : `${stats?.avgRating || 4.8}/5`}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Star className="text-yellow-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="border border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mr-4">
                  <Wand2 className="text-white" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Generate AI Content</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Create complete video packages with AI-generated scripts, SEO, and thumbnails.
              </p>
              <Button 
                className="w-full bg-primary text-white hover:bg-red-700 transition-colors"
                onClick={() => onShowSection("create")}
                data-testid="button-start-creating"
              >
                Start Creating
              </Button>
            </CardContent>
          </Card>
          
          <Card className="border border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mr-4">
                  <Upload className="text-white" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Upload Custom Script</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Have your own script? Upload it and generate SEO, thumbnails, and production assets.
              </p>
              <Button 
                className="w-full bg-secondary text-white hover:bg-blue-700 transition-colors"
                onClick={() => onShowSection("create")}
                data-testid="button-upload-script"
              >
                Upload Script
              </Button>
            </CardContent>
          </Card>
          
          <Card className="border border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-4">
                  <LayoutTemplate className="text-white" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Use Templates</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Choose from popular YouTube content templates and formats.
              </p>
              <Button 
                className="w-full bg-green-500 text-white hover:bg-green-600 transition-colors"
                onClick={() => onShowSection("create")}
                data-testid="button-browse-templates"
              >
                Browse Templates
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Projects */}
        <Card className="border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Projects</h3>
              <Button
                variant="ghost"
                className="text-primary hover:text-red-700 font-medium"
                onClick={() => onShowSection("projects")}
                data-testid="button-view-all-projects"
              >
                View All
              </Button>
            </div>
          </div>
          
          <CardContent className="p-6">
            {projectsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentProjects && recentProjects.length > 0 ? (
              <div className="space-y-0">
                {recentProjects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                        <Video className="text-primary" size={20} />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900" data-testid={`project-title-${project.id}`}>
                          {project.title}
                        </h4>
                        <p className="text-sm text-gray-600" data-testid={`project-date-${project.id}`}>
                          Created {formatDate(project.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span 
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}
                        data-testid={`project-status-${project.id}`}
                      >
                        {getStatusText(project.status)}
                      </span>
                      <Button variant="ghost" size="icon" className="p-2 text-gray-400 hover:text-gray-600">
                        <MoreHorizontal size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Video className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                <p className="text-gray-600 mb-4">Get started by creating your first video content package.</p>
                <Button 
                  onClick={() => onShowSection("create")}
                  className="bg-primary text-white hover:bg-red-700"
                  data-testid="button-create-first-project"
                >
                  Create Your First Project
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
