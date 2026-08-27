const DURATION = 500;
const EASING = "cubic-bezier(0.08, 0.9, 0.11, 1)";

export class Accordion {
	private static instances: Accordion[] = [];

	el: HTMLDetailsElement;
	summary: HTMLElement;
	content: HTMLElement;
	initWidth: number;
	animation: Animation | null;
	dinkerAnimation: Animation | null;
	isClosing: boolean;
	isExpanding: boolean;

	constructor(el: HTMLDetailsElement) {
		// Store the <details> element and its descendants
		this.el = el;
		this.summary = el.querySelector("summary") as HTMLElement;
		this.content = el.querySelector(".content") as HTMLElement;

		// Store initial width for keyframing
		this.initWidth = this.summary.offsetWidth;

		// Store the animation object (so we can cancel it, if needed)
		this.animation = null;
		this.dinkerAnimation = null;

		//  Store information about the animation state
		this.isClosing = false;
		this.isExpanding = false;

		// Detect when someone clicks on the summary element
		this.summary.addEventListener("click", (e) => this.onClick(e));

		Accordion.instances.push(this);
	}

	onClick(e: MouseEvent) {
		e.preventDefault();
		// Add an overflow on <details> to avoid content overflowing
		this.el.style.overflow = "hidden";

		if (this.isClosing || !this.el.open) {
			this.closeOthers();
			this.open();
		} else if (this.isExpanding || this.el.open) {
			this.shrink();
		}
	}

	closeOthers() {
		for (const instance of Accordion.instances) {
			if (instance !== this && (instance.el.open || instance.isExpanding)) {
				instance.el.style.overflow = "hidden";
				instance.shrink();
			}
		}
	}

	shrink() {
		this.isClosing = true;
		const startHeight = `${this.el.offsetHeight}px`;
		const endHeight = `${this.summary.offsetHeight}px`;
		const startWidth = `${this.el.offsetWidth}px`;
		const endWidth = `${this.initWidth}px`;

		if (this.animation) {
			this.animation.cancel();
		}

		this.animation = this.el.animate({
			height: [startHeight, endHeight],
			width: [startWidth, endWidth],
		}, {
			duration: 200,
			easing: "ease-out",
		});

		this.animation.onfinish = () => this.onAnimationFinish(false);
		this.animation.oncancel = () => this.isClosing = false;
	}

	open() {
		this.el.style.height = `${this.el.offsetHeight}px`;
		this.el.style.width = `${this.el.offsetWidth}`;
		// since we're preventing default behavior, we need to set [open] manually
		this.el.open = true;
		window.requestAnimationFrame(() => this.expand());
	}

	expand() {
		this.isExpanding = true;
		const startHeight = `${this.el.offsetHeight}px`;
		const endHeight = `${this.summary.offsetHeight + this.content.offsetHeight}px`;
		const startWidth = `${this.initWidth}px`;
		const endWidth = `${this.el.offsetWidth}px`;

		if (this.animation) {
			this.animation.cancel();
		}

		this.animation = this.el.animate({
			height: [startHeight, endHeight],
			width: [startWidth, endWidth],
		}, {
			duration: 200,
			easing: "ease-out",
		});

		this.animation.onfinish = () => this.onAnimationFinish(true);
		this.animation.oncancel = () => this.isExpanding = false;
	}

	onAnimationFinish(isOpen: boolean) {
		this.el.open = isOpen;
		// clear stored animation
		this.animation = null;
		// reset state variables
		this.isClosing = false;
		this.isExpanding = false;
		// remove overflow hidden & fixed height
		this.el.style.height = "";
		this.el.style.width = "";
		this.el.style.overflow = "";
	}
}
