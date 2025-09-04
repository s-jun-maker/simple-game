import "./style.css";
import { gsap } from "gsap";

// biome-ignore lint/style/noNonNullAssertion: exist in index.html
const canvas = document.querySelector<HTMLCanvasElement>("canvas")!;

// biome-ignore lint/style/noNonNullAssertion: context2d always exists
const c = canvas.getContext("2d")!;

canvas.width = innerWidth;
canvas.height = innerHeight;

const projectiles: Projectile[] = [];

const enemies: Enemy[] = [];

// biome-ignore lint/complexity/noStaticOnlyClass: ...
class Background {
	static draw() {
		c.fillStyle = "rgba(0, 0, 0, 0.2)";
		c.fillRect(0, 0, canvas.width, canvas.height);
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
			cancelAnimationFrame(animatetionId);
		}

		projectiles.forEach((projectile) => {
			const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
			// when projectiles touch enemies
			if (dist - enemy.radius - projectile.radius < 1) {
				// queue enemy and projectile for deletion
				hitEnemies.add(enemy);
				deadProjectiles.add(projectile);
			}
		});
	});

	// After all checks, remove queued objects in reverse order
	for (let i = enemies.length - 1; i >= 0; i--) {
		if (hitEnemies.has(enemies[i])) {
			if (enemies[i].radius > 20) {
				enemies[i].radius -= 10;
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
}

animate();
spawnEnemies();
window.addEventListener("click", (event) => {
	const originX = player.x;
	const originY = player.y;
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
