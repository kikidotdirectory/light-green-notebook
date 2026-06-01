const total = 110;
const img = document.querySelector(".spread-image");
const imgContainer = document.querySelector(".notebook-container")
const blocks = document.querySelectorAll(".annotation-block");
const pad = (n) => String(n).padStart(3, "0");
const src = (n) => `/assets/lgn/${pad(n)}.png`;
let current = 0;

function show(n) {
	const target = Math.min(Math.max(n, 0), total);
	current = target;
	const nextSrc = src(target);
	// Gate the image + layout swap on the new image being decoded so they change
	// in the same frame. Otherwise data-spread (which resizes the container for the
	// cover) applies before the async image decode, briefly showing the old spread
	// in the new layout — the 1→0 flash.
	const loader = new Image();
	loader.src = nextSrc;
	const apply = () => {
		if (current !== target) return; // superseded by a newer navigation
		img.src = nextSrc;
		imgContainer.dataset.spread = target;
	};
	loader.decode().then(apply, apply);
	blocks.forEach((b) => {
		b.hidden = Number(b.dataset.spread) !== target;
	});
	location.hash = target;
	// preload neighbours so navigation doesn't flash a blank image
	if (target > 0) new Image().src = src(target - 1);
	if (target < total) new Image().src = src(target + 1);
}

document.querySelector(".prev").addEventListener("click", () => show(current - 1));
document.querySelector(".next").addEventListener("click", () => show(current + 1));
addEventListener("keydown", (e) => {
	if (e.key === "ArrowLeft") show(current - 1);
	if (e.key === "ArrowRight") show(current + 1);
});

const fromHash = Number(location.hash.slice(1));
show(Number.isInteger(fromHash) && fromHash >= 0 ? fromHash : 0);
