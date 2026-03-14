import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { CategoryPage } from "./components/CategoryPage";
import { DSNLTVPage } from "./components/DSNLTVPage";
import { FounderPage } from "./components/FounderPage";
import BlogsPage from "./pages/BlogsPage";
import BlogDetailPage from "./pages/BlogDetailPage";
import NewsletterPage from "./pages/NewsletterPage";
import NewsletterDetailPage from "./pages/NewsletterDetailPage";
import EditorialPage from "./pages/EditorialPage";
import EditorialDetailPage from "./pages/EditorialDetailPage";

const queryClient = new QueryClient();

function QueryRedirectHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const blogId = params.get("blogId");
    if (blogId) {
      navigate(`/blogs/${blogId}`, { replace: true });
      return;
    }
    const newsletterId = params.get("newsletterId");
    if (newsletterId) {
      navigate(`/newsletter/${newsletterId}`, { replace: true });
      return;
    }
    const editorialId = params.get("editorialId");
    if (editorialId) {
      navigate(`/editorial-speaks/${editorialId}`, { replace: true });
      return;
    }
  }, [location.search, navigate]);

  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <QueryRedirectHandler />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/category/:category" element={<CategoryPage />} />
          <Route path="/dsnl-tv" element={<DSNLTVPage />} />
          <Route path="/founder" element={<FounderPage />} />
          <Route path="/blogs" element={<BlogsPage />} />
          <Route path="/blogs/:postId" element={<BlogDetailPage />} />
          <Route path="/newsletter" element={<NewsletterPage />} />
          <Route path="/newsletter/:postId" element={<NewsletterDetailPage />} />
          <Route path="/editorial-speaks" element={<EditorialPage />} />
          <Route path="/editorial-speaks/:postId" element={<EditorialDetailPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
