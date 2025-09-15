import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">404</h1>
        <p className="mb-6 text-xl text-muted-foreground">Sayfa bulunamadı</p>
        <a 
          href="/" 
          className="inline-flex items-center px-6 py-3 text-sm font-medium text-primary-foreground bg-gradient-to-r from-primary to-accent rounded-lg hover:from-primary/90 hover:to-accent/90 transition-all duration-300"
        >
          Ana Sayfaya Dön
        </a>
      </div>
    </div>
  );
};

export default NotFound;
