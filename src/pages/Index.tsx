import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Code, Palette, Zap, Users, Star, Github, Sparkles, Download, Play, Heart } from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: <Code className="h-6 w-6" />,
      title: "Modern React",
      description: "Built with React 18, TypeScript, and Vite for blazing fast development.",
      color: "text-blue-500"
    },
    {
      icon: <Palette className="h-6 w-6" />,
      title: "Beautiful Design",
      description: "Styled with Tailwind CSS and Shadcn/ui components for elegant interfaces.",
      color: "text-purple-500"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Lightning Fast",
      description: "Optimized build process and hot reload for instant feedback.",
      color: "text-yellow-500"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Developer Friendly",
      description: "Clean architecture and best practices for maintainable code.",
      color: "text-green-500"
    }
  ];

  const stats = [
    { label: "Components", value: "50+", icon: <Sparkles className="h-4 w-4" /> },
    { label: "Downloads", value: "10K+", icon: <Download className="h-4 w-4" /> },
    { label: "Stars", value: "2.5K", icon: <Star className="h-4 w-4" /> },
    { label: "Contributors", value: "100+", icon: <Heart className="h-4 w-4" /> }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-24 px-4">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium animate-fade-in">
            ✨ Welcome to your new project
          </Badge>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 animate-fade-in">
            Build Something
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-fade-in" style={{animationDelay: "200ms"}}>
              Amazing
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in" style={{animationDelay: "400ms"}}>
            Your React + Vite + TypeScript application is ready. Start building beautiful, 
            responsive web applications with modern tools and best practices.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in" style={{animationDelay: "600ms"}}>
            <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 hover:scale-105 transition-all duration-200 px-8 py-3 text-lg font-semibold shadow-lg">
              <Play className="mr-2 h-5 w-5" />
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 hover:scale-105 transition-all duration-200 px-8 py-3 text-lg">
              <Github className="mr-2 h-5 w-5" /> 
              View on GitHub
            </Button>
          </div>
          
          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto animate-fade-in" style={{animationDelay: "800ms"}}>
            {stats.map((stat, index) => (
              <div key={index} className="text-center bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-4 hover:bg-primary-foreground/20 transition-all duration-200">
                <div className="flex items-center justify-center mb-2 text-primary-foreground">
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-primary-foreground">{stat.value}</div>
                <div className="text-sm text-primary-foreground/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <Badge variant="outline" className="mb-4">
              Features
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Everything You Need
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Built with the latest technologies and best practices to help you create 
              exceptional web applications that scale with your business.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-border hover:border-primary/50 hover:shadow-lg hover:scale-105 transition-all duration-300 animate-fade-in group" style={{animationDelay: `${index * 150}ms`}}>
                <CardHeader className="pb-4">
                  <div className={`w-14 h-14 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200 ${feature.color}`}>
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMjAgMjBjMC01LjUtNC41LTEwLTEwLTEwcy0xMCA0LjUtMTAgMTAgNC41IDEwIDEwIDEwIDEwLTQuNSAxMC0xMHptMTAgMGMwLTUuNS00LjUtMTAtMTAtMTBzLTEwIDQuNS0xMCAxMCA0LjUgMTAgMTAgMTAgMTAtNC41IDEwLTEweiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6">
            Get Started
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-8">
            Ready to Start Building?
          </h2>
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-12 max-w-2xl mx-auto leading-relaxed">
            Your development environment is configured and ready. 
            Time to bring your ideas to life!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 hover:scale-105 transition-all duration-200 px-8 py-3 text-lg font-semibold">
              <Play className="mr-2 h-5 w-5" />
              Start Building Now
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 hover:scale-105 transition-all duration-200 px-8 py-3 text-lg">
              <Github className="mr-2 h-5 w-5" />
              View Documentation
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-3 text-primary-foreground/80">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-lg">Trusted by 10,000+ developers worldwide</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-muted/50 border-t">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-muted-foreground">
            Built with ❤️ using React, TypeScript, Vite, and Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;