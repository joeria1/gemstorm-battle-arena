
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import { RainProvider } from "./context/RainContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import RainTimer from "./components/RainTimer";
import RainAnimation from "./components/RainAnimation";
import Index from "./pages/Index";
import CaseBattles from "./pages/CaseBattles";
import Mines from "./pages/Mines";
import Blackjack from "./pages/Blackjack";
import NotFound from "./pages/NotFound";
import { useRain } from "./context/RainContext";

const queryClient = new QueryClient();

// Wrapper component to conditionally render rain animation
const RainWrapper = ({ children }: { children: React.ReactNode }) => {
  const { showRainAnimation } = useRain();
  
  return (
    <>
      {showRainAnimation && <RainAnimation />}
      {children}
    </>
  );
};

const AppContent = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/cases" element={<CaseBattles />} />
          <Route path="/mines" element={<Mines />} />
          <Route path="/blackjack" element={<Blackjack />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <RainTimer />
      <Footer />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <UserProvider>
        <RainProvider>
          <BrowserRouter>
            <RainWrapper>
              <AppContent />
            </RainWrapper>
          </BrowserRouter>
          <Toaster />
          <Sonner />
        </RainProvider>
      </UserProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
