const total = 110;
const img = document.getElementById("spread-image");
const blocks = document.querySelectorAll(".annotation-block");
const pad = (n) => String(n).padStart(3, "0");
const src = (n) => `/assets/lgn/${pad(n)}.png`;
let current = 0;

function show(n) {
	current = Math.min(Math.max(n, 0), total);
	img.src = src(current);
	blocks.forEach((b) => {
		b.hidden = Number(b.dataset.spread) !== current;
	});
	location.hash = current;
	// preload neighbours so navigation doesn't flash a blank image
	if (current > 1) new Image().src = src(current - 1);
	if (current < total) new Image().src = src(current + 1);
}

document.querySelector(".prev").addEventListener("click", () => show(current - 1));
document.querySelector(".next").addEventListener("click", () => show(current + 1));
addEventListener("keydown", (e) => {
	if (e.key === "ArrowLeft") show(current - 1);
	if (e.key === "ArrowRight") show(current + 1);
});

const fromHash = Number(location.hash.slice(1));
show(Number.isInteger(fromHash) && fromHash >= 0 ? fromHash : 0);
