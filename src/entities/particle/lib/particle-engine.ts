import { clamp, randomBetween } from '@/shared/lib/utils';

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
}

export interface ParticleConfig {
  count: number;
  size: number;
  speed: number;
  colors: string[];
  gravity: number;
  friction: number;
  bounce: number;
}

export class ParticleEngine {
  private particles: Map<number, Particle> = new Map();
  private nextId = 0;
  private config: ParticleConfig;
  private mousePosition = { x: 0, y: 0 };
  private canvasSize = { width: 0, height: 0 };

  constructor(config: ParticleConfig) {
    this.config = config;
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

    this.particles.forEach((particle) => {
      // Update position
      particle.x += particle.vx * deltaTime;
      particle.y += particle.vy * deltaTime;

      // Apply gravity
      particle.vy += this.config.gravity * deltaTime;

      // Apply friction
      particle.vx *= Math.pow(this.config.friction, deltaTime);
      particle.vy *= Math.pow(this.config.friction, deltaTime);

      // Update life
      particle.age += deltaTime;
      particle.life = 1 - particle.age / particle.maxLife;

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

  // Optimized rendering with batching
  render(ctx: CanvasRenderingContext2D) {
    const particles = this.getParticles();

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
