import "./style.css";
import { gsap } from "gsap";

// biome-ignore lint/style/noNonNullAssertion: exist in index.html
const canvas = document.querySelector<HTMLCanvasElement>("canvas")!;

// biome-ignore lint/style/noNonNullAssertion: context2d always exists
const c = canvas.getContext("2d")!;

canvas.width = innerWidth;
canvas.height = innerHeight;

const projectiles: Projectile[] = [];
const particles: Particle[] = [];
const enemies: Enemy[] = [];
let score = 0;
function resetGame() {
	// clear arrays
	projectiles.length = 0;
	particles.length = 0;
	enemies.length = 0;
	// reset player position
	player.x = canvas.width / 2;
	player.y = canvas.height / 2;
	score = 0;
	animate();
}

function drawReplayOverlay() {
	// dim overlay
	c.save();
	c.fillStyle = "rgba(0, 0, 0, 0.6)";
	c.fillRect(0, 0, canvas.width, canvas.height);

	// replay button
	const btnWidth = 200;
	const btnHeight = 60;
	const btnX = canvas.width / 2 - btnWidth / 2;
	const btnY = canvas.height / 2 - btnHeight / 2;
	c.fillStyle = "#ffffff";
	c.strokeStyle = "#333";
	c.lineWidth = 2;
	c.fillRect(btnX, btnY, btnWidth, btnHeight);
	c.strokeRect(btnX, btnY, btnWidth, btnHeight);

	c.fillStyle = "#000";
	c.font = "bold 20px Arial";
	c.textAlign = "center";
	c.textBaseline = "middle";
	c.fillText("Replay", canvas.width / 2, canvas.height / 2);
	c.restore();
}

function handleGameOver() {
	// stop the loop and draw the overlay once
	cancelAnimationFrame(animatetionId);
	Background.draw();
	player.draw();
	drawReplayOverlay();
}

// biome-ignore lint/complexity/noStaticOnlyClass: ...
class Background {
	static draw() {
		c.fillStyle = "rgba(0, 0, 0, 0.2)";
		c.fillRect(0, 0, canvas.width, canvas.height);
		// draw score at top-center
		c.save();
		c.fillStyle = "white";
		c.font = "bold 24px Arial";
		c.textAlign = "center";
		c.textBaseline = "top";
		c.fillText(`Score: ${score}`, canvas.width / 2, 8);
		c.restore();

		// overlay is drawn explicitly by handleGameOver()
	}
}

class Player {
	x: number;
	y: number;

	radius: number;
	color: string;
	constructor(x?: number, y?: number, radius?: number, color?: string) {
		this.x = x ?? canvas.width / 2;
		this.y = y ?? canvas.height / 2;
		this.radius = radius ?? 30;
		this.color = color ?? "blue";
	}

	draw() {
		c.beginPath();
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		c.fillStyle = this.color;
		c.fill();
		c.closePath();
	}
}

class Projectile {
	x: number;
	y: number;
	radius: number;
	color: string;
	velocity: {
		x: number;
		y: number;
	};
	constructor(
		x: number,
		y: number,
		radius: number,
		color: string,
		velocity: { x: number; y: number },
	) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.color = color;
		this.velocity = velocity;
	}

	draw() {
		c.beginPath();
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		c.fillStyle = this.color;
		c.fill();
		c.closePath();
	}
	update() {
		this.x += this.velocity.x;
		this.y += this.velocity.y;
		this.draw();
	}
}

const friction = 0.99;
class Particle {
	x: number;
	y: number;
	radius: number;
	color: string;
	velocity: {
		x: number;
		y: number;
	};
	alpha: number;
	constructor(
		x: number,
		y: number,
		radius: number,
		color: string,
		velocity: { x: number; y: number },
	) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.color = color;
		this.velocity = velocity;
		this.alpha = 1;
	}

	draw() {
		c.save();
		c.globalAlpha = Math.max(this.alpha, 0);
		c.beginPath();
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		c.fillStyle = this.color;
		c.fill();
		c.restore();
	}
	update() {
		this.draw();
		this.velocity.x *= friction;
		this.velocity.y *= friction;
		this.x += this.velocity.x;
		this.y += this.velocity.y;
		this.alpha -= 0.01;
	}
}

class Enemy {
	x: number;
	y: number;
	radius: number;
	color: string;
	velocity: {
		x: number;
		y: number;
	};
	constructor(
		x: number,
		y: number,
		radius: number,
		color: string,
		velocity: { x: number; y: number },
	) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.color = color;
		this.velocity = velocity;
	}

	draw() {
		c.beginPath();
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		c.fillStyle = this.color;
		c.fill();
		c.closePath();
	}
	update() {
		this.x += this.velocity.x;
		this.y += this.velocity.y;
		this.draw();
	}
}

const x = canvas.width / 2;
const y = canvas.height / 2;

const player = new Player(x, y, 10, "white");

function spawnEnemies(intervalMs: number = 1000): number {
	return window.setInterval(() => {
		const radius = 10 + Math.random() * 20; // [10, 30)
		const side = Math.floor(Math.random() * 4); // 0: left, 1: right, 2: top, 3: bottom

		let spawnX = 0;
		let spawnY = 0;
		if (side === 0) {
			// left
			spawnX = -radius;
			spawnY = Math.random() * canvas.height;
		} else if (side === 1) {
			// right
			spawnX = canvas.width + radius;
			spawnY = Math.random() * canvas.height;
		} else if (side === 2) {
			// top
			spawnX = Math.random() * canvas.width;
			spawnY = -radius;
		} else {
			// bottom
			spawnX = Math.random() * canvas.width;
			spawnY = canvas.height + radius;
		}

		const angle = Math.atan2(player.y - spawnY, player.x - spawnX);
		const speed = 5 + Math.random() * 1.5; // [1, 2.5)
		const velocity = { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed };
		const color = `hsl(${Math.floor(Math.random() * 360 + 10)}, 60%, 50%)`;

		enemies.push(new Enemy(spawnX, spawnY, radius, color, velocity));
	}, intervalMs);
}

let animatetionId: number;
function animate() {
	animatetionId = requestAnimationFrame(animate);
	Background.draw();
	player.draw();
	// Collect objects to delete this frame
	const deadProjectiles = new Set<Projectile>();
	const hitEnemies = new Set<Enemy>();
	const deadParticles = new Set<Particle>();

	particles.forEach((particle) => {
		particle.update();
		if (particle.alpha < 0) {
			deadParticles.add(particle);
		}
	});
	projectiles.forEach((projectile) => {
		projectile.update();

		if (
			projectile.x - projectile.radius < 0 ||
			projectile.x + projectile.radius > canvas.width ||
			projectile.y - projectile.radius < 0 ||
			projectile.y + projectile.radius > canvas.height
		) {
			// mark off-screen projectiles for deletion
			deadProjectiles.add(projectile);
		}
	});
	enemies.forEach((enemy) => {
		enemy.update();

		const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
		if (dist - enemy.radius - player.radius < 1) {
			handleGameOver();
			return; // stop further processing this frame
		}

		projectiles.forEach((projectile) => {
			const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
			// when projectiles touch enemies
			if (dist - enemy.radius - projectile.radius < 1) {
				for (let i = 0; i < enemy.radius * 2; i++) {
					const particle = new Particle(
						enemy.x,
						enemy.y,
						3 + Math.random() * 3,
						enemy.color,
						{
							x: (Math.random() - 0.5) * Math.random() * 10,
							y: Math.random() * -0.5 * Math.random() * 10,
						},
					);
					particles.push(particle);
				}
				// queue enemy and projectile for deletion
				hitEnemies.add(enemy);
				deadProjectiles.add(projectile);
				// increase score on hit
				score += 1;
			}
		});
	});

	// After all checks, remove queued objects in reverse order
	for (let i = enemies.length - 1; i >= 0; i--) {
		if (hitEnemies.has(enemies[i])) {
			if (enemies[i].radius > 20) {
				gsap.to(enemies[i], {
					radius: enemies[i].radius - 10,
				});
			} else {
				enemies.splice(i, 1);
			}
		}
	}
	for (let i = projectiles.length - 1; i >= 0; i--) {
		if (deadProjectiles.has(projectiles[i])) {
			projectiles.splice(i, 1);
		}
	}
	for (let i = particles.length - 1; i >= 0; i--) {
		if (deadParticles.has(particles[i])) {
			particles.splice(i, 1);
		}
	}
}

animate();
spawnEnemies(200);
window.addEventListener("click", (event) => {
	// detect click within replay button bounds even when overlay is drawn
	const btnWidth = 200;
	const btnHeight = 60;
	const btnX = canvas.width / 2 - btnWidth / 2;
	const btnY = canvas.height / 2 - btnHeight / 2;
	if (
		event.clientX >= btnX &&
		event.clientX <= btnX + btnWidth &&
		event.clientY >= btnY &&
		event.clientY <= btnY + btnHeight
	) {
		resetGame();
		return;
	}
	const originX = player.x;
	const originY = player.y;
	gsap.to(player, {
		x: event.x,
		y: event.y,
		duration: 3,
	});
	const baseAngle = Math.atan2(
		event.clientY - originY,
		event.clientX - originX,
	);

	const projectileSize = 5;
	const count = 10; // number of projectiles in the spread
	const spread = Math.PI / 12; // total half-angle of the spread (≈15°)
	const speed = 10 + Math.random() * 3; // random speed in [4, 7)

	for (let i = 0; i < count; i++) {
		const t = (i / (count - 1)) * 2 - 1; // [-1, 1]
		const jitter = (Math.random() - 0.5) * (spread / 3);
		const angle = baseAngle + t * spread + jitter;
		const velocity = { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed };

		const projectile = new Projectile(
			originX,
			originY,
			projectileSize,
			"white",
			velocity,
		);
		projectiles.push(projectile);
	}
});

// Register PWA Service Worker (production only)
if ("serviceWorker" in navigator) {
	window.addEventListener("load", () => {
		navigator.serviceWorker
			.register("/sw.js")
			.then(() => {
				// eslint-disable-next-line no-console
				console.log("Service worker registered");
			})
			.catch((err) => {
				// eslint-disable-next-line no-console
				console.warn("Service worker registration failed", err);
			});
	});
}
