import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome, {user?.username}!</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <p className="text-muted-foreground mb-6 text-center">You have successfully logged in to your account.</p>
          <Button 
            onClick={handleLogout} 
            variant="outline" 
            className="mt-4"
          >
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
