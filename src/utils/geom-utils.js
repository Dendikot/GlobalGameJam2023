import * as Phaser from 'phaser';

import {ExtPoint} from "../objects/ext-point";
const Line = Phaser.Geom.Line;
const Point = Phaser.Geom.Point;
const Rectangle = Phaser.Geom.Rectangle;

export class GeomUtils {

    static isClockwise(points)
    {
        var sum = 0;
        for (var i = 0; i < points.length - 1; i++) {
            sum += (points[i + 1].x() - points[i].x()) * (points[i + 1].y() - points[i].y());
        }
        sum += (points[0].x() - points[0].x()) * (points[points.length - 1].y() - points[points.length - 1].y());
        return sum >= 0;
    }

    static isCounterClockwise(points) {
        return ! GeomUtils.isClockwise(points);
    }

    static lineContainsLine(line1, line2) {
        const m1Abs = Math.abs(this.calculateSlope(line1));
        const m2Abs = Math.abs(this.calculateSlope(line2));

        if (m1Abs === m2Abs) {
            //
            // Vertical lines
            //
            if (m1Abs === Infinity) {
                if (line1.x1 !== line2.x1) {
                    return false;
                }

                const line1MinY = Math.min(line1.y1, line1.y2);
                const line1MaxY = Math.max(line1.y1, line1.y2);

                return line1MinY <= line2.y1 && line1MaxY >= line2.y1 &&
                    line1MinY <= line2.y2 && line1MaxY >= line2.y2;
            }
            //
            // Non-vertical lines
            //
            else {
                if (this.calculateYIntercept(line1) !== this.calculateYIntercept(line2)) {
                    return false;
                }

                const line1MinX = Math.min(line1.x1, line1.x2);
                const line1MaxX = Math.max(line1.x1, line1.x2);

                return line1MinX <= line2.x1 && line1MaxX >= line2.x1 &&
                    line1MinX <= line2.x2 && line1MaxX >= line2.x2;
            }
        } else {
            return false;
        }
    }

    static lContainsLine(line1, line2) {
        // Vertical
        if (line1.x1 === line1.x2 && line1.x1 === line2.x1 && line1.x1 === line2.x2) {
            const line1Small = smaller(line1.y1, line1.y2);
            const line1Large = larger(line1.y1, line1.y2);
            const line2Small = smaller(line2.y1, line2.y2);
            const line2Large = larger(line2.y1, line2.y2);

            return (line2Small >= line1Small && line2Large <= line1Large);
        }

        // Horizontal
        if (line1.y1 === line1.y2 && line1.y1 === line2.y1 && line1.y1 === line2.y2) {
            const line1Small = smaller(line1.x1, line1.x2);
            const line1Large = larger(line1.x1, line1.x2);
            const line2Small = smaller(line2.x1, line2.x2);
            const line2Large = larger(line2.x1, line2.x2);

            return (line2Small >= line1Small && line2Large <= line1Large);
        }

        function smaller(num1, num2) {
            return Math.min(num1, num2);
        }

        function larger(num1, num2) {
            return Math.max(num1, num2);
        }

        return false;
    }

    static lineContainsLineAndNotEqual(line1, line2) {
        return ! this.linesAreEqual(line1, line2) && this.lineContainsLine(line1, line2);
    }

    static lineContainsAnyLine(line1, lines) {
        return lines.some((line) => this.lineContainsLine(line1, line));
    }

    static lineOverlapsAnyLine(line1, lines) {
        return lines.some((line) => this.lineContainsLine(line1, line) || this.lineContainsLine(line, line1));
    }

    static linesContainLine(lines, line1) {
        return lines.some((line) => this.lineContainsLine(line, line1));
    }

    static linesOverlapsLine(lines, line1) {
        return lines.some((line) => this.lineContainsLine(line, line1) || this.lineContainsLine(line1, line));
    }

    static linesAreEqual(line1, line2) {
        return line1.x1 === line2.x1 &&
            line1.x2 === line2.x2 &&
            line1.y1 === line2.y1 &&
            line1.y2 === line2.y2;
    }

    static subtractLinesWhereLine1ContainsLine2(line1, line2) {
        const vertical = line1.x1 === line1.x2;
        const horizontal = line1.y1 === line1.y2;

        if (! vertical && ! horizontal) {
            throw new Error("Only supports vertical or horizontal lines.");
        }

        if (line1.x1 === line2.x1 && line1.y1 === line2.y1 && line1.x2 === line2.x2 && line1.y2 === line2.y2) {
            return [];
        } else if (vertical) {
            const x = line1.x1;
            if (line1.y1 === line2.y1) {
                return [ new Line(x, line2.y2, x, line1.y2) ];
            } else if (line1.y2 === line2.y2) {
                return [ new Line(x, line1.y1, x, line2.y1) ];
            } else {
                return [ new Line(x, line1.y1, x, line2.y1), new Line(x, line2.y2, x, line1.y2) ];
            }
        } else if (horizontal) {
            const y = line1.y1;
            if (line1.x1 === line2.x1) {
                return [ new Line(line2.x2, y, line1.x2, y) ];
            } else if (line1.x2 === line2.x2) {
                return [ new Line(line1.x1, y, line2.x1, y) ];
            } else {
                return [ new Line(line1.x1, y, line2.x1, y), new Line(line2.x2, y, line1.x2, y) ];
            }
        }
    }

    static getLinesFromPolygonPoints(points){
        const length = points.length;

        if (length < 3) {
            throw new Error('Expecting at least 3 points in a polygon');
        }

        let lines = [];

        for (let i = 0; i < length - 1; i++) {
            lines.push(new Line(points[i].x(), points[i].y(),points[i + 1].x(), points[i + 1].y()));
        }

        //
        // If first point is not same as last point, add an additional line to close polygon
        //
        if (! points[0].equals(points[length - 1])) {
            lines.push(new Line(points[length - 1].x(), points[length - 1].y(),points[0].x(), points[0].y()));
        }

        return lines;
    }

    static getPolygonPointsFromLines(lines){
        let points = lines.map((line) => new ExtPoint(new Point(line.x1, line.y1)));
        points.push(new ExtPoint(new Point(points[0].x(), points[0].y())));

        return points;
    }

    static makeClockwisePoints(points) {
        if (! this.isClockwisePoints(points)) {
            points.reverse();
        }

        return points;
    }

    static isClockwisePoints(points) {
        return this.isClockwiseLines(this.getLinesFromPolygonPoints(points));
    }

    static isClockwiseLines(lines) {
        let sum = 0;
        lines.forEach((line) => {
            sum += (line.x2 + line.x1) * (line.y2 - line.y1);
        });

        return sum >= 0;
    }

    static reverseLines(lines) {
        let reversedLines = lines.map((line) => new Line(line.x2, line.y2, line.x1, line.y1));
        reversedLines.reverse();
        return reversedLines;
    }

    static getClockwiseRectanglePoints(rectangle) {
        let points = [];
        points.push(new ExtPoint(new Point(rectangle.left, rectangle.top)));
        points.push(new ExtPoint(new Point(rectangle.right, rectangle.top)));
        points.push(new ExtPoint(new Point(rectangle.right, rectangle.bottom)));
        points.push(new ExtPoint(new Point(rectangle.left, rectangle.bottom)));
        points.push(new ExtPoint(new Point(rectangle.left, rectangle.top)));
        return points;
    }

    static calculatePointFromOrigin(origin, angleDegrees, distance) {
        const xAdder = distance * Math.cos(GeomUtils.degressToRadians(angleDegrees));
        const yAdder = distance * Math.sin(GeomUtils.degressToRadians(angleDegrees));

        return new Point(origin.x + xAdder, origin.y + yAdder);
    }

    static degressToRadians(degrees) {
        return (degrees * Math.PI) / 180;
    }

    static collisionLineSegmentArrays(lines1, lines2) {
        for (let line1 of lines1) {
            for (let line2 of lines2) {
                if (this.collisionLineSegments(line1, line2)) {
                    return true;
                }
            }
        }
        return false;
    }

    static collisionLineSegments(line1, line2) {
        if (this.linesAreEqual(line1, line2)) {
            return true;
        }

        if (this.lineContainsLine(line1, line2) || this.lineContainsLine(line2, line1)) {
            return true;
        }

        const m1 = this.calculateSlope(line1);
        const m2 = this.calculateSlope(line2);

        const vertical1 = (m1 === Infinity || m1 === -Infinity);
        const vertical2 = (m2 === Infinity || m2 === -Infinity);

        const b1 = this.calculateYIntercept(line1);
        const b2 = this.calculateYIntercept(line2);

        const xWithinLine = (x, line) => {
            return (line.x1 <= x && x <= line.x2) || (line.x1 >= x && x >= line.x2);
        };

        const yWithinLine = (y, line) => {
            return (line.y1 <= y && y <= line.y2) || (line.y1 >= y && y >= line.y2);
        };

        if (vertical1 && vertical2) {
            if (line1.x1 === line2.x1) {
                return yWithinLine(line2.y1, line1) || yWithinLine(line2.y2, line1);
            } else {
                return false;
            }
        } else if (vertical1) {
            const y = (m2 * line1.x1) + b2;
            return yWithinLine(y, line1) && xWithinLine(line1.x1, line2)
        } else if (vertical2) {
            const y = (m1 * line2.x1) + b1;
            return yWithinLine(y, line2) && xWithinLine(line2.x1, line1)
        } else if (m1 === m2) {
            if (b1 !== b2) {
                return false;
            } else {
                return xWithinLine(line2.x1, line1) || xWithinLine(line2.x2, line1);
            }
        } else {
            const x = (b2 - b1) / (m1 - m2);
            const y = (m1 * x) + b1;

            return xWithinLine(x, line1) && xWithinLine(x, line2);
        }
    }

    static calculateSlope(line){
        return (line.y2 - line.y1) / (line.x2 - line.x1);
    }

    static calculateYIntercept(line) {
        const m = this.calculateSlope(line);
        return line.y1 - (m * line.x1);
    }

    static lineToString(line) {
        const l = line;
        return `${l.x1},${l.y1},${l.x2},${l.y2}`;
    };
}
