export function launchConfetti() {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '99999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth * window.devicePixelRatio;
  let height = canvas.height = window.innerHeight * window.devicePixelRatio;
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth * window.devicePixelRatio;
    height = canvas.height = window.innerHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  });

  const colors = ['#06b6d4', '#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];
  const confettiCount = 120;
  const particles = [];

  class Particle {
    constructor() {
      // Start in a cluster in the center or scattered
      this.x = window.innerWidth / 2 + (Math.random() * 200 - 100);
      this.y = window.innerHeight / 2 + (Math.random() * 100 - 50);
      // Explode outwards
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 4;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed - 5; // biased upwards
      this.r = Math.random() * 6 + 4;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.tilt = Math.random() * 10 - 5;
      this.tiltAngleIncremental = Math.random() * 0.1 + 0.05;
      this.tiltAngle = Math.random() * Math.PI;
      this.gravity = 0.25;
      this.drag = 0.97;
    }
    draw() {
      ctx.beginPath();
      ctx.lineWidth = this.r;
      ctx.strokeStyle = this.color;
      ctx.moveTo(this.x + this.tilt + this.r / 2, this.y);
      ctx.lineTo(this.x + this.tilt, this.y + this.tilt + this.r / 2);
      ctx.stroke();
    }
    update() {
      this.vx *= this.drag;
      this.vy *= this.drag;
      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;

      this.tiltAngle += this.tiltAngleIncremental;
      this.tilt = Math.sin(this.tiltAngle) * 8;

      return this.y < window.innerHeight && this.x > 0 && this.x < window.innerWidth;
    }
  }

  for (let i = 0; i < confettiCount; i++) {
    particles.push(new Particle());
  }

  function anim() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let activeParticles = 0;
    particles.forEach(p => {
      p.draw();
      const active = p.update();
      if (active) activeParticles++;
    });

    if (activeParticles > 0) {
      requestAnimationFrame(anim);
    } else {
      canvas.remove();
    }
  }
  anim();
}
