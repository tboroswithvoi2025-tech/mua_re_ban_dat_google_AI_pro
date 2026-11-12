import { useMemo } from 'react'

export default function ParticleBackground() {
  const particles = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.5 + 0.2,
    }))
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Gradient orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-mystic-600/10 rounded-full blur-3xl animate-float-slow" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-abyss-600/10 rounded-full blur-3xl animate-float-medium" />
      <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl animate-float-fast" />

      {/* Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-mystic-300 animate-twinkle"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            boxShadow: `0 0 ${p.size * 3}px rgba(196, 181, 253, 0.5)`,
          }}
        />
      ))}

      {/* Crystal grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.5) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(139, 92, 246, 0.5) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />
    </div>
  )
}
