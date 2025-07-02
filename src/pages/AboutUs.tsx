import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { AiOutlineLinkedin } from "react-icons/ai";

export default function AboutUs() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <div className="px-4 pt-6 sm:px-8 sm:pt-8">
        <Button
          className="text-white hover:bg-purple-500/20 hover:text-white bg-purple-500"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="flex items-center justify-center px-4 mt-[5%]">
        <div className="w-full max-w-2xl p-6 sm:p-8 bg-white/10 rounded-xl shadow-xl backdrop-blur-md">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
            About Us
          </h1>
          <p className="text-gray-400 text-md sm:text-base mb-4">
            Welcome to BookIt Booking! As pioneers in digital ticketing, our mission is to connect audiences to the best experiences across movies, plays, concerts, and sports events. We believe in making bookings seamless, fast, and secure—right at your fingertips.
          </p>
          <p className="text-gray-400 text-md sm:text-base mb-4">
            Started by passionate fans of live entertainment and cinema, we're committed to delivering an intuitive interface, detailed event listings, transparent pricing, and a trustworthy method to secure your place at any event.
          </p>
          <p className="text-gray-400 text-md sm:text-base mb-4">
            Whether you're a movie buff, theatre lover, sports enthusiast, or just looking for weekend fun, BookIt Booking is your trusted companion for discovering and booking the best events in your city.
          </p>
          <p className="text-purple-500 text-md sm:text-base font-bold">
            Thank you for choosing us—let's create memorable moments together.
          </p>
        </div>
      </div>
      <footer className="mt-auto w-full px-4 sm:px-8 py-6 md:py-8 rounded-xl bg-white/10 backdrop-blur-md border-t border-purple-500/20 shadow-inner">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <p className="text-gray-300 text-sm sm:text-base">
            We'd love to connect with you!
          </p>
          <div className="flex justify-center items-center space-x-4">
            <button
              onClick={() => window.open("https://shannuportfolio.netlify.app")}
              title="Portfolio"
              className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-md"
            >
              <User className="w-5 h-5" />
            </button>
            <button
              onClick={() => window.open("https://github.com/shannu4466")}
              title="GitHub"
              className="w-10 h-10 rounded-full bg-white text-gray-900 hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-md"
            >
              <FaGithub className="w-5 h-5" />
            </button>
            <button
              onClick={() => window.open("https://instagram.com/shannu4466")}
              title="Instagram"
              className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-yellow-400 text-white hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-md"
            >
              <FaInstagram className="w-5 h-5" />
            </button>
            <button
              onClick={() =>
                window.open("https://www.linkedin.com/in/shanmukha-rao-thangudu-504a72250/")
              }
              title="LinkedIn"
              className="w-10 h-10 rounded-full bg-blue-600 text-white hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-md"
            >
              <AiOutlineLinkedin className="w-5 h-5" />
            </button>
          </div>

          <p className="text-gray-500 text-xs sm:text-sm">
            &copy; {new Date().getFullYear()} BookIt. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}
