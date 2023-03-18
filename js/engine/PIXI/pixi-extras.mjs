import { Graphics } from "./pixi.mjs";

// Can't find any way to add the official pixi graphic extras so I'm doing this the dirty way :P


/**
 * Draw a regular polygon where all sides are the same length.
 *
 * _Note: Only available with **@pixi/graphics-extras**._
 * @method PIXI.Graphics#drawRegularPolygon
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} radius - Polygon radius
 * @param {number} sides - Minimum value is 3
 * @param {number} rotation - Starting rotation values in radians..
 * @returns {PIXI.Graphics} This Graphics object. Good for chaining method calls
 */
Graphics.prototype.drawRegularPolygon = function(
    x, y, radius, sides, rotation = 0
){
    sides = Math.max(sides | 0, 3);
    const startAngle = (-1 * Math.PI / 2) + rotation;
    const delta = (Math.PI * 2) / sides;
    const polygon = [];

    for (let i = 0; i < sides; i++)
    {
        const angle = (i * delta) + startAngle;

        polygon.push(
            x + (radius * Math.cos(angle)),
            y + (radius * Math.sin(angle))
        );
    }

    return this.drawPolygon(polygon);
}



export default null;