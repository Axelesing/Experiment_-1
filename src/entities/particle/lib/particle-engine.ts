import { clamp, randomBetween } from '../../../shared/lib/utils';

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  age: number;
  trail?: { x: number; y: number; life: number }[];
}

export interface ParticleConfig {
  count: number;
  size: number;
  speed: number;
  colors: string[];
  gravity: number;
  friction: number;
  bounce: number;
  trailLength?: number;
  particleInteraction?: boolean;
  attraction?: number;
  repulsion?: number;
}

export interface ParticlePreset {
  name: string;
  config: Partial<ParticleConfig>;
  description: string;
}

export class ParticleEngine {
  private particles: Map<number, Particle> = new Map();
  private nextId = 0;
  private config: ParticleConfig;
  private mousePosition = { x: 0, y: 0 };
  private canvasSize = { width: 0, height: 0 };

  constructor(config: ParticleConfig) {
    this.config = {
      trailLength: 10,
      particleInteraction: false,
      attraction: 0.1,
      repulsion: 0.05,
      ...config,
    };
    // Don't initialize particles here - wait for canvas size
  }

  updateConfig(config: Partial<ParticleConfig>) {
    this.config = { ...this.config, ...config };

    // Reinitialize particles if count changed and canvas size is set
    if (
      config.count !== undefined &&
      this.canvasSize.width > 0 &&
      this.canvasSize.height > 0
    ) {
      this.initParticles();
    }
  }

  setMousePosition(x: number, y: number) {
    this.mousePosition = { x, y };
  }

  setCanvasSize(width: number, height: number) {
    this.canvasSize = { width, height };
    // Initialize particles when canvas size is set
    if (this.particles.size === 0) {
      this.initParticles();
    }
  }

  public initParticles() {
    this.particles.clear();
    for (let i = 0; i < this.config.count; i++) {
      const x = randomBetween(0, this.canvasSize.width);
      const y = randomBetween(0, this.canvasSize.height);
      this.addParticle(x, y);
    }
  }

  addParticle(
    x: number,
    y: number,
    customConfig?: Partial<Particle>
  ): Particle {
    const angle = randomBetween(0, Math.PI * 2);
    const speed = randomBetween(0.5, 2) * this.config.speed;

    const particle: Particle = {
      id: this.nextId++,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: randomBetween(1, this.config.size),
      color:
        this.config.colors[
          Math.floor(Math.random() * this.config.colors.length)
        ],
      life: 1,
      maxLife: randomBetween(100, 300),
      age: 0,
      trail: this.config.trailLength ? [] : undefined,
      ...customConfig,
    };

    this.particles.set(particle.id, particle);
    return particle;
  }

  addBurst(x: number, y: number, count: number = 20) {
    for (let i = 0; i < count; i++) {
      this.addParticle(x, y);
    }
  }

  update(deltaTime: number = 1) {
    const particlesToRemove: number[] = [];
    const particles = Array.from(this.particles.values());

    particles.forEach((particle) => {
      // Update trail
      if (particle.trail && this.config.trailLength) {
        particle.trail.push({
          x: particle.x,
          y: particle.y,
          life: particle.life,
        });
        if (particle.trail.length > this.config.trailLength) {
          particle.trail.shift();
        }
      }

      // Update position
      particle.x += particle.vx * deltaTime;
      particle.y += particle.vy * deltaTime;

      // Apply gravity
      particle.vy += this.config.gravity * deltaTime;

      // Apply friction
      particle.vx *= Math.pow(this.config.friction, deltaTime);
      particle.vy *= Math.pow(this.config.friction, deltaTime);

      // Particle interactions
      if (this.config.particleInteraction) {
        particles.forEach((otherParticle) => {
          if (otherParticle.id === particle.id) return;

          const dx = otherParticle.x - particle.x;
          const dy = otherParticle.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 50 && distance > 0) {
            const force = (50 - distance) / 50;
            const attraction = this.config.attraction || 0.1;
            const repulsion = this.config.repulsion || 0.05;

            if (distance < 20) {
              // Repulsion when too close
              particle.vx -= (dx / distance) * force * repulsion * deltaTime;
              particle.vy -= (dy / distance) * force * repulsion * deltaTime;
            } else {
              // Attraction when at medium distance
              particle.vx += (dx / distance) * force * attraction * deltaTime;
              particle.vy += (dy / distance) * force * attraction * deltaTime;
            }
          }
        });
      }

      // Mouse interaction
      const dx = this.mousePosition.x - particle.x;
      const dy = this.mousePosition.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 100 && distance > 0) {
        const force = (100 - distance) / 100;
        particle.vx += (dx / distance) * force * 0.5 * deltaTime;
        particle.vy += (dy / distance) * force * 0.5 * deltaTime;
      }

      // Bounce off walls
      if (particle.x < 0 || particle.x > this.canvasSize.width) {
        particle.vx *= -this.config.bounce;
        particle.x = clamp(particle.x, 0, this.canvasSize.width);
      }
      if (particle.y < 0 || particle.y > this.canvasSize.height) {
        particle.vy *= -this.config.bounce;
        particle.y = clamp(particle.y, 0, this.canvasSize.height);
      }

      // Update life
      particle.age += deltaTime;
      particle.life = 1 - particle.age / particle.maxLife;

      // Remove dead particles
      if (particle.life <= 0) {
        particlesToRemove.push(particle.id);
      }
    });

    particlesToRemove.forEach((id) => this.particles.delete(id));
  }

  getParticles(): Particle[] {
    return Array.from(this.particles.values());
  }

  getParticleCount(): number {
    return this.particles.size;
  }

  clear() {
    this.particles.clear();
  }

  // Optimized rendering with batching and trails
  render(ctx: CanvasRenderingContext2D) {
    const particles = this.getParticles();

    // Render trails first (behind particles)
    if (this.config.trailLength) {
      particles.forEach((particle) => {
        if (particle.trail && particle.trail.length > 1) {
          ctx.save();
          ctx.strokeStyle = particle.color;
          ctx.lineWidth = particle.size * 0.5;
          ctx.lineCap = 'round';
          ctx.beginPath();

          particle.trail.forEach((point, index) => {
            const alpha = (point.life * index) / particle.trail!.length;
            ctx.globalAlpha = alpha * 0.3;

            if (index === 0) {
              ctx.moveTo(point.x, point.y);
            } else {
              ctx.lineTo(point.x, point.y);
            }
          });

          ctx.stroke();
          ctx.restore();
        }
      });
    }

    // Group particles by color for better performance
    const colorGroups = new Map<string, Particle[]>();

    particles.forEach((particle) => {
      if (!colorGroups.has(particle.color)) {
        colorGroups.set(particle.color, []);
      }
      colorGroups.get(particle.color)!.push(particle);
    });

    // Render each color group
    colorGroups.forEach((group, color) => {
      ctx.save();
      ctx.fillStyle = color;

      group.forEach((particle) => {
        ctx.globalAlpha = particle.life;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    });
  }
}

// Predefined particle presets
export const PARTICLE_PRESETS: ParticlePreset[] = [
  {
    name: 'Классический',
    description: 'Стандартные частицы с базовой физикой',
    config: {
      gravity: 0.05,
      friction: 0.99,
      bounce: 0.8,
      trailLength: 0,
      particleInteraction: false,
    },
  },
  {
    name: 'Огонь',
    description: 'Частицы, имитирующие пламя',
    config: {
      colors: ['#ff4500', '#ff6347', '#ffa500', '#ffff00', '#ffd700'],
      gravity: -0.02,
      friction: 0.98,
      bounce: 0.3,
      trailLength: 15,
      particleInteraction: false,
    },
  },
  {
    name: 'Дождь',
    description: 'Падающие капли дождя',
    config: {
      colors: ['#87ceeb', '#4682b4', '#5f9ea0', '#b0c4de'],
      gravity: 0.3,
      friction: 0.99,
      bounce: 0.1,
      trailLength: 8,
      particleInteraction: false,
    },
  },
  {
    name: 'Снег',
    description: 'Медленно падающие снежинки',
    config: {
      colors: ['#ffffff', '#f0f8ff', '#e6e6fa', '#f5f5dc'],
      gravity: 0.01,
      friction: 0.995,
      bounce: 0.2,
      trailLength: 5,
      particleInteraction: false,
    },
  },
  {
    name: 'Магнитное поле',
    description: 'Частицы с магнитным взаимодействием',
    config: {
      gravity: 0,
      friction: 0.99,
      bounce: 0.9,
      trailLength: 12,
      particleInteraction: true,
      attraction: 0.2,
      repulsion: 0.1,
    },
  },
  {
    name: 'Взрыв',
    description: 'Энергичные частицы с отскоками',
    config: {
      colors: ['#ff0000', '#ff4500', '#ffa500', '#ffff00'],
      gravity: 0.1,
      friction: 0.95,
      bounce: 0.9,
      trailLength: 20,
      particleInteraction: false,
    },
  },
];
