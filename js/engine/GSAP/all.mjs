import gsap from "./gsap-core.mjs";
import CSSPlugin from "./CSSPlugin.mjs";
const gsapWithCSS = gsap.registerPlugin(CSSPlugin) || gsap, // to protect from tree shaking
	TweenMaxWithCSS = gsapWithCSS.core.Tween;

export { gsapWithCSS as gsap, gsapWithCSS as default, TweenMaxWithCSS as TweenMax, CSSPlugin };

export { TweenLite, TimelineMax, TimelineLite, Power0, Power1, Power2, Power3, Power4, Linear, Quad, Cubic, Quart, Quint, Strong, Elastic, Back, SteppedEase, Bounce, Sine, Expo, Circ, wrap, wrapYoyo, distribute, random, snap, normalize, getUnit, clamp, splitColor, toArray, mapRange, pipe, unitize, interpolate, shuffle, selector } from "./gsap-core.mjs";
export * from "./CustomEase.mjs";
export * from "./Draggable.mjs";
export * from "./CSSRulePlugin.mjs";
export * from "./EaselPlugin.mjs";
export * from "./EasePack.mjs";
export * from "./Flip.mjs";
export * from "./MotionPathPlugin.mjs";
export * from "./Observer.mjs";
export * from "./PixiPlugin.mjs";
export * from "./ScrollToPlugin.mjs";
export * from "./ScrollTrigger.mjs";
export * from "./TextPlugin.mjs";

//BONUS EXPORTS
// export * from "./DrawSVGPlugin.js";
// export * from "./Physics2DPlugin.js";
// export * from "./PhysicsPropsPlugin.js";
// export * from "./ScrambleTextPlugin.js";
// export * from "./CustomBounce.js";
// export * from "./CustomWiggle.js";
// export * from "./GSDevTools.js";
// export * from "./InertiaPlugin.js";
// export * from "./MorphSVGPlugin.js";
// export * from "./MotionPathHelper.js";
// export * from "./ScrollSmoother.js";
// export * from "./SplitText.js";