const Line = Phaser.Geom.Line;

export class StringUtils {
    static padRight(s, n, p = ' ') {
        let ps = '';
        for (let i = 0; i < n; i++) {
            ps += p;
        }

        ps = s + ps;
        return ps.slice(0, n);
    }

    static prettyLine(l) {
        return `[${l.x1},${l.y1}],[${l.x2},${l.y2}]`;
    }

    static wrap(s, n) {
        let str = '';
        while (s.length > n) {
            str += s.substring(0, n) + '\n';
            s = s.substring(n, s.length);
        }
        str += s;
        return str;
    }

    static dataToLines(cols, data) {
        let lines = [];
        let line = '';
        let colIndex = 0;
        let numCols = cols.length;

        data.forEach((d) => {
            line += StringUtils.padRight(d, cols[colIndex]);
            if (colIndex + 1 === numCols) {
                lines.push(line);
                line = '';
                colIndex = 0;
            } else {
                colIndex++;
            }
        });

        if (line !== '') {
            lines.push(line);
        }

        return lines;
    }
}