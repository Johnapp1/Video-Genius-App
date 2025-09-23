import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const authSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AuthFormData = z.infer<typeof authSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("login");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  // Redirect if already logged in
  if (user) {
    setLocation("/");
    return null;
  }

  const onSubmit = async (data: AuthFormData) => {
    try {
      if (activeTab === "login") {
        await loginMutation.mutateAsync(data);
      } else {
        await registerMutation.mutateAsync(data);
      }
      setLocation("/");
    } catch (error) {
      // Error handling is done in the mutation callbacks
    }
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-red-50">
      <div className="w-full max-w-6xl mx-4 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-md border-red-200 shadow-2xl">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="text-white text-2xl" size={24} data-testid="icon-video" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                AI YouTube Creator Studio
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Generate complete video packages with AI
              </p>
            </CardHeader>
            
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <TabsContent value="login" className="space-y-4">
                    <div>
                      <Label htmlFor="login-username" className="block text-sm font-medium text-gray-700 mb-2">
                        Username
                      </Label>
                      <Input
                        id="login-username"
                        type="text"
                        className="border-2 border-red-500 focus:ring-red-500 focus:border-red-500"
                        placeholder="Enter your username"
                        {...register("username")}
                        data-testid="input-username"
                      />
                      {errors.username && (
                        <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                      </Label>
                      <Input
                        id="login-password"
                        type="password"
                        className="border-2 border-red-500 focus:ring-red-500 focus:border-red-500"
                        placeholder="Enter your password"
                        {...register("password")}
                        data-testid="input-password"
                      />
                      {errors.password && (
                        <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="register" className="space-y-4">
                    <div>
                      <Label htmlFor="register-username" className="block text-sm font-medium text-gray-700 mb-2">
                        Username
                      </Label>
                      <Input
                        id="register-username"
                        type="text"
                        className="border-2 border-red-500 focus:ring-red-500 focus:border-red-500"
                        placeholder="Choose a username"
                        {...register("username")}
                        data-testid="input-register-username"
                      />
                      {errors.username && (
                        <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                      </Label>
                      <Input
                        id="register-password"
                        type="password"
                        className="border-2 border-red-500 focus:ring-red-500 focus:border-red-500"
                        placeholder="Create a password (min 6 characters)"
                        {...register("password")}
                        data-testid="input-register-password"
                      />
                      {errors.password && (
                        <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                      )}
                    </div>
                  </TabsContent>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-primary text-white hover:bg-red-700 transition-colors"
                    disabled={isLoading}
                    data-testid="button-submit"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {activeTab === "login" ? "Signing In..." : "Creating Account..."}
                      </>
                    ) : (
                      activeTab === "login" ? "Sign In" : "Create Account"
                    )}
                  </Button>
                </form>
              </Tabs>
              
              <div className="text-center mt-6">
                <a href="#" className="text-secondary hover:underline text-sm">
                  Forgot your password?
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hero Section */}
        <div className="hidden lg:flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-32 h-32 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-8">
              <Video className="text-white text-5xl" size={48} />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Create Amazing YouTube Content
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Generate complete video packages with AI-powered scripts, SEO optimization, thumbnail concepts, and production assets.
            </p>
            <div className="space-y-4 text-left">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span className="text-gray-700">AI-generated scripts that sound human</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span className="text-gray-700">SEO optimization for better reach</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span className="text-gray-700">Professional thumbnail concepts</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
