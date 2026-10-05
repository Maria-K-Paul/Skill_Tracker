export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-background pointer-events-none">
      {/* Premium minimal dot grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,var(--border)_1px,transparent_0)] bg-[size:32px_32px] opacity-50 dark:opacity-20 mask-image-[radial-gradient(ellipse_at_center,black,transparent_80%)]" style={{ WebkitMaskImage: 'radial-gradient(ellipse at center, black, transparent 80%)' }}></div>
      
      {/* Very subtle ambient top glow */}
      <div className="absolute -top-1/2 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[100px] opacity-50" />
    </div>
  );
}
