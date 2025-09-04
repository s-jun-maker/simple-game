import "./style.css";

// biome-ignore lint/style/noNonNullAssertion: exist in index.html
const canvas = document.querySelector<HTMLCanvasElement>("canvas")!;

// biome-ignore lint/style/noNonNullAssertion: context2d always exists
const c = canvas.getContext("2d")!;

canvas.width = innerWidth;
canvas.height = innerHeight;

const projectiles: Projectile[] = [];

const enemies: Enemy[] = [];

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
class Background {
	static draw() {
		c.clearRect(0, 0, canvas.width, canvas.height);
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

const player = new Player(x, y, 30, "blue");

function animate() {
	Background.draw();
	player.draw();
	projectiles.forEach((projectile) => {
		projectile.update();
	});
	enemies.forEach((enemy) => {
		enemy.update();
	});
	requestAnimationFrame(animate);
}

animate();
window.addEventListener("click", (event) => {
	const angle = Math.atan2(event.clientY - player.y, event.clientX - player.x);
	const velocity = { x: Math.cos(angle) * 5, y: Math.sin(angle) * 5 };
	const projectile = new Projectile(x, y, 10, "red", velocity);
	projectiles.push(projectile);
});
