
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Movies from "./pages/Movies";
import Events from "./pages/Events";
import Plays from "./pages/Plays";
import Sports from "./pages/Sports";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import MovieDetails from "./pages/MovieDetails";
import PlayDetails from "./pages/PlayDetails";
import EventDetails from "./pages/EventDetails";
import SportDetails from "./pages/SportDetails";
import BookingPage from "./pages/BookingPage";
import OfferDetails from "./pages/OfferDetails";
import Settings from "./pages/Settings";
import MyOffers from "./pages/MyOffers";
import MyBookings from "./pages/MyBookings";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminAddContent from "./pages/AdminAddContent";
import AdminRegister from "./pages/AdminRegister";
import SuperAdmin from "./pages/SuperAdmin";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";
import AboutUs from "./pages/AboutUs";
import WishlistButton from "./components/WishlistButton";
import Chatbot from "./pages/Chatbot";
import Help from "./pages/Help";
import EditEvent from "./pages/EditEvent";
import PaymentGatewayPage from "./pages/PaymentGatewayPage";

const queryClient = new QueryClient();

const App = () => (
  <div className="select-none">
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Routes>
              <Route path="/payment-gateway/:token" element={<PaymentGatewayPage />} />
              <Route path='/chatbot' element={< Chatbot />} />
              <Route path="/login" element={<Login />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/landing-page" element={<LandingPage />} />
              <Route path="/" element={<Index />} />
              <Route path="/movies" element={<Movies />} />
              <Route path="/events" element={<Events />} />
              <Route path="/plays" element={<Plays />} />
              <Route path="/sports" element={<Sports />} />
              {/* Navigate to details of that respective event page and It's working*/}
              <Route path="/movie/:id" element={<MovieDetails />} />
              <Route path="/play/:id" element={<PlayDetails />} />
              <Route path="/event/:id" element={<EventDetails />} />
              <Route path="/sport/:id" element={<SportDetails />} />
              {/* Booking navigation */}
              <Route path="/booking/movie/:id" element={<BookingPage />} />
              <Route path="/booking/event/:id" element={<BookingPage />} />
              <Route path="/booking/play/:id" element={<BookingPage />} />
              <Route path="/booking/sport/:id" element={<BookingPage />} />
              <Route path="/offer/:id" element={<OfferDetails />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/my-offers" element={<MyOffers />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/wishlist" element={<WishlistButton item_id={""} item_type={""} />} />
              <Route path="/help" element={<Help />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/register" element={<AdminRegister />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/super-admin" element={<SuperAdmin />} />
              <Route path="/admin/add/:type" element={<AdminAddContent />} />
              <Route path="/admin/edit/:type/:id" element={<EditEvent />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </div>
);

export default App;
