import { Body } from './body';


export class Physics {
	 /**
     * Checks if two rectangular bodies intersect
     * @param  {Rect} body1 First body with {x,y} position and {width, height}
     * @param  {Rect} body2 Second body
     * @return {bool} True if they intersect, otherwise false
     */
    static intersects(body1: Body, body2: Body) : boolean {
        var intersectionX = body1.position.x < body2.position.x + body2.width 
        				 && body1.position.x + body1.width > body2.position.x;
        
        var intersectionY = body1.position.y < body2.position.y + body2.height 
        				 && body1.position.y + body1.height > body2.position.y;

        return intersectionX && intersectionY;
    }

    static collide(body1: Body, body2: Body, collisionCallback: Function) : boolean {
        if (this.intersects(body1, body2)) {
            collisionCallback();

            return true;
        }

        return false;
    }
}

