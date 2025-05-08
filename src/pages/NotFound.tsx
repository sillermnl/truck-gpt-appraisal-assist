
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-6xl font-bold text-truck-dark-blue mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-6">Diese Seite wurde nicht gefunden</p>
        <p className="text-gray-500 mb-8">
          Die angeforderte Seite existiert nicht oder ist nicht mehr verfügbar.
        </p>
        <Button 
          asChild 
          className="bg-truck-dark-blue hover:bg-truck-blue"
        >
          <a href="/">Zurück zur Startseite</a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
