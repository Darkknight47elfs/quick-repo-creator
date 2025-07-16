import { useState } from 'react';
import { Link } from 'react-router-dom';

interface NavLinkProps {
  to: string;
  text: string;
}

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // MobileNavLink component inside Navigation to access state
  const MobileNavLink: React.FC<NavLinkProps> = ({ to, text }) => (
    <Link
      to={to}
      className="px-4 py-2 text-gray-700 transition duration-300 rounded-md hover:bg-gray-100"
      onClick={() => setIsMobileMenuOpen(false)}
    >
      {text}
    </Link>
  );

  return (
    <nav className="relative w-full shadow-md">
      <div className="container px-4 mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Always visible */}
          <div className="z-10 flex-shrink-0">
            <Link to="/">
              <img
                src="images/logocrop.png"
                alt="Logo"
                className="w-[120px] h-auto md:w-[180px] lg:w-[220px]"
              />
            </Link>
          </div>

          {/* Desktop Menu - Hidden on mobile */}
          <div className="hidden pr-4 ml-auto space-x-4 md:flex">
            <NavLink to="/about" text="About" />
            <NavLink to="/contact" text="Contact" />
            <NavLink to="/privacy-policy" text="Privacy Policy" />
          </div>

          {/* Mobile Menu Button - Hidden on desktop */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-700 transition rounded-md md:hidden hover:text-white hover:bg-black"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu - Animated dropdown */}
        <div
          className={`md:hidden absolute w-full bg-white shadow-md overflow-hidden transition-all duration-300 ease-out ${
            isMobileMenuOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="flex flex-col p-4 space-y-3">  
            <MobileNavLink to="/about" text="About" />
            <MobileNavLink to="/contact" text="Contact" />
            <MobileNavLink to="/privacy-policy" text="Privacy Policy" />
          </div>
        </div>
      </div>
    </nav>
  );
};

// Separate component for desktop links
const NavLink: React.FC<NavLinkProps> = ({ to, text }) => (
  <Link
    to={to}
    className="px-4 py-2 text-gray-700 transition duration-300 rounded-md hover:text-white hover:bg-black"
  >
    {text}
  </Link>
);

export default Navbar;