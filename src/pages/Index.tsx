import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-24 px-4">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <img 
              src="/images/logocrop.png" 
              alt="KrishiSat Logo" 
              className="w-48 h-auto mx-auto mb-6 md:w-64"
            />
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6">
            Welcome to
            <span className="block bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              KrishiSat
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-12 max-w-3xl mx-auto leading-relaxed">
            A state-of-the-art remote sensing and GIS application leveraging space satellite 
            technology and AI to promote sustainable agriculture, enhance farming productivity, 
            and conserve resources.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link 
              to="/login" 
              className="inline-flex items-center justify-center px-8 py-3 text-lg font-semibold text-primary bg-primary-foreground rounded-full hover:bg-primary-foreground/90 hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Login to Dashboard
            </Link>
            <Link 
              to="/register-user" 
              className="inline-flex items-center justify-center px-8 py-3 text-lg font-semibold text-primary-foreground border-2 border-primary-foreground rounded-full hover:bg-primary-foreground/10 hover:scale-105 transition-all duration-200"
            >
              Register Now
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Advanced Agricultural Intelligence
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Real-time insights into crop health, water usage, and land productivity, 
              empowering farmers with actionable data for sustainable farming.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-lg border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-green-600 text-xl">🛰️</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Satellite Monitoring</h3>
              <p className="text-muted-foreground">
                Real-time satellite imagery and data analysis for comprehensive farm monitoring.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-blue-600 text-xl">🌱</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Crop Health Analysis</h3>
              <p className="text-muted-foreground">
                AI-powered analysis of crop health, growth patterns, and yield predictions.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-purple-600 text-xl">💧</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Water Management</h3>
              <p className="text-muted-foreground">
                Optimize water usage with intelligent irrigation recommendations and monitoring.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 px-4 bg-gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-8">
            Developed by X Boson AI
          </h2>
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-12 max-w-2xl mx-auto leading-relaxed">
            By using advanced analytics and geospatial tools, KrishiSat enables data-driven 
            decisions that optimize resource use, minimize waste, and enhance overall 
            agricultural efficiency, contributing to global food security.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/about" 
              className="inline-flex items-center justify-center px-8 py-3 text-lg font-semibold text-primary bg-primary-foreground rounded-full hover:bg-primary-foreground/90 hover:scale-105 transition-all duration-200"
            >
              Learn More
            </Link>
            <Link 
              to="/contact" 
              className="inline-flex items-center justify-center px-8 py-3 text-lg font-semibold text-primary-foreground border-2 border-primary-foreground rounded-full hover:bg-primary-foreground/10 hover:scale-105 transition-all duration-200"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-muted/50 border-t">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-muted-foreground">
            © 2025 KrishiSat by X Boson AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;