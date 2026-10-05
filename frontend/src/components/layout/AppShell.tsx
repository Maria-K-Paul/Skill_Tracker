import { useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { AnimatedBackground } from "../ui/animated-background";
import { PageTransition } from "../ui/page-transition";

export function AppShell({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (mainRef.current) {
        setScrolled(mainRef.current.scrollTop > 80);
      }
    };
    
    const mainEl = mainRef.current;
    if (mainEl) {
      mainEl.addEventListener("scroll", handleScroll);
      return () => mainEl.removeEventListener("scroll", handleScroll);
    }
  }, []);

  return (
    <div className="flex h-screen bg-transparent overflow-hidden selection:bg-primary/20 selection:text-primary">
      <AnimatedBackground />
      <Topbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} scrolled={scrolled} />
      <div className="flex flex-1 pt-[64px] h-full w-full">
        <Sidebar isCollapsed={isCollapsed} />
        <main ref={mainRef} className="flex-1 overflow-y-auto overflow-x-hidden bg-transparent p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <PageTransition key={location.pathname}>
              {children}
            </PageTransition>
          </div>
        </main>
      </div>
    </div>
  );
}
