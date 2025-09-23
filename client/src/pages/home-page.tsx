import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut, Video, Home, Plus, Folder, Bell, User } from "lucide-react";
import Dashboard from "@/components/dashboard";
import CreateContent from "@/components/create-content";
import Projects from "@/components/projects";
import GenerationProgress from "@/components/generation-progress";
import GeneratedResults from "@/components/generated-results";

type Section = "dashboard" | "create" | "projects" | "progress" | "results";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const [currentSection, setCurrentSection] = useState<Section>("dashboard");
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const showSection = (section: Section) => {
    setCurrentSection(section);
  };

  const showProgress = (projectId?: string) => {
    if (projectId) setCurrentProjectId(projectId);
    setCurrentSection("progress");
  };

  const showResults = (projectId?: string) => {
    if (projectId) setCurrentProjectId(projectId);
    setCurrentSection("results");
  };

  const renderSection = () => {
    switch (currentSection) {
      case "dashboard":
        return <Dashboard onShowSection={showSection} />;
      case "create":
        return <CreateContent onShowProgress={showProgress} onShowResults={showResults} />;
      case "projects":
        return <Projects onShowSection={showSection} onShowResults={showResults} />;
      case "progress":
        return <GenerationProgress onShowResults={showResults} projectId={currentProjectId} />;
      case "results":
        return <GeneratedResults projectId={currentProjectId} onShowSection={showSection} />;
      default:
        return <Dashboard onShowSection={showSection} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Video className="text-white" size={20} data-testid="icon-logo" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">AI YouTube Creator Studio</h1>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Button
              variant="ghost"
              className={`nav-btn font-medium ${currentSection === "dashboard" ? "text-primary" : "text-gray-600"} hover:text-primary transition-colors`}
              onClick={() => showSection("dashboard")}
              data-testid="nav-dashboard"
            >
              <Home className="mr-2" size={16} />
              Dashboard
            </Button>
            <Button
              variant="ghost"
              className={`nav-btn font-medium ${currentSection === "create" ? "text-primary" : "text-gray-600"} hover:text-primary transition-colors`}
              onClick={() => showSection("create")}
              data-testid="nav-create"
            >
              <Plus className="mr-2" size={16} />
              Create Content
            </Button>
            <Button
              variant="ghost"
              className={`nav-btn font-medium ${currentSection === "projects" ? "text-primary" : "text-gray-600"} hover:text-primary transition-colors`}
              onClick={() => showSection("projects")}
              data-testid="nav-projects"
            >
              <Folder className="mr-2" size={16} />
              Projects
            </Button>
          </nav>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-gray-600 hover:text-primary">
              <Bell size={20} data-testid="button-notifications" />
            </Button>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" className="flex items-center space-x-2 text-gray-600 hover:text-primary">
                <User size={20} />
                <span className="hidden md:block" data-testid="text-username">{user?.username}</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-gray-600 hover:text-primary"
                disabled={logoutMutation.isPending}
                data-testid="button-logout"
              >
                <LogOut size={20} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {renderSection()}
      </main>
    </div>
  );
}
