/**
 * Created by Mark on 2021/6/5.
 */

const url = window.location.protocol + "//" + window.location.host;
const svgns = "http://www.w3.org/2000/svg";

function draw_0_control(c, x, y) {
    let circle = document.createElementNS(svgns, 'circle');
    circle.setAttributeNS(null, 'cx', x);
    circle.setAttributeNS(null, 'cy', y);
    circle.setAttributeNS(null, 'r', "5");
    circle.setAttributeNS(null, 'style', 'fill: #FFFFFF; stroke: #000000; stroke-width: 2px;');
    c.appendChild(circle);
}

function draw_1_control(c, x, y) {
    let circle = document.createElementNS(svgns, 'circle');
    circle.setAttributeNS(null, 'cx', x);
    circle.setAttributeNS(null, 'cy', y);
    circle.setAttributeNS(null, 'r', "5");
    circle.setAttributeNS(null, 'style', 'fill: #000000; stroke: #000000; stroke-width: 2px;');
    c.appendChild(circle);
}

function draw_not_gate(c, x, y) {
    let circle = document.createElementNS(svgns, 'circle');
    circle.setAttributeNS(null, 'cx', x);
    circle.setAttributeNS(null, 'cy', y);
    circle.setAttributeNS(null, 'r', "10");
    circle.setAttributeNS(null, 'style', 'fill: #FFFFFF; stroke: #000000; stroke-width: 2px;');
    c.appendChild(circle);
    draw_line(c, x, y - 10, x, y + 10);
    draw_line(c, x - 10, y, x + 10, y);
}

function draw_line(c, x1, y1, x2, y2, is_dashed) {
    let line = document.createElementNS(svgns, 'line');
    line.setAttributeNS(null, 'x1', x1);
    line.setAttributeNS(null, 'y1', y1);
    line.setAttributeNS(null, 'x2', x2);
    line.setAttributeNS(null, 'y2', y2);
    if (is_dashed) {
        line.setAttributeNS(null, 'style', 'stroke: #000000; stroke-width: 2px; stroke-dasharray:5,5;');
    } else {
        line.setAttributeNS(null, 'style', 'stroke: #000000; stroke-width: 2px;');
    }
    c.appendChild(line);
}

function draw(circuit, wire_count) {
    let rows = circuit.split('\n');
    while (rows[rows.length - 1] == '') {
        rows.pop();
    }

    let c = document.getElementById("svg_diagram");
    c.innerHTML = '';

    c.setAttribute("width", rows.length * 50 + 100);
    c.setAttribute("height", wire_count * 50);

    for (let i = 0; i < wire_count; i++) {
        let x = 50, y = 25;
        draw_line(c, x, y + i * 50, x + 50 * rows.length, y + i * 50);
    }

    for (let i = 0; i < rows.length; i++) {
        let x = 50 + 50 * i + 20;
        if (rows[i] == '') {
            draw_line(c, x + 5, 13, x + 5, wire_count * 50 - 10, true);
        } else {
            draw_line(c, x + 5, 25, x + 5, wire_count * 50 - 25, false);
        }
        for (let j = 0; j < wire_count; j++) {
            let y = 20 + j * 50;
            if (rows[i][j] == '0') {
                draw_0_control(c, x + 5, y + 5);
            } else if (rows[i][j] == '1') {
                draw_1_control(c, x + 5, y + 5);
            } else if (rows[i][j] == '2') {
                draw_not_gate(c, x + 5, y + 5);
            }
        }
    }
}

function get_result(data, gate_count) {
    axios({
        method: 'post',
        url: url + '/start',
        data: {
            circuit: data
        }
    }).then((res) => {
        if (res.data['success']) {
            let in_table = res.data['data']['input'];
            let out_table = res.data['data']['output'];
            let text = '';

            for (let i = 0; i < in_table.length; i++) {
                text = text + in_table[i] + ' -> ' + out_table[i] + '\n';
            }

            document.getElementById('truth_table').value = text;
            document.getElementById('info').innerHTML = 'Gate count: ' + gate_count;
            document.getElementById('invalid_circuit').innerHTML = '';
            document.getElementById("btn_save").removeAttribute("disabled");
            draw(data, Math.log2(in_table.length));
        } else {
            document.getElementById('invalid_circuit').innerHTML = res.data['message'];
        }
    }).catch(res => {
        console.log(res.data);
        document.getElementById('debug').innerHTML = res.data;
    });
}

function run() {
    let data = document.getElementById('circuit').value;
    data += '\n';
    data = data.replace(/ /g, '');
    let re_result = data.match(/^[0-1,3, ]*2[0-1,3, ]*$\n/mg);
    let rows = data.split('\n')
    let gate_count = 0;

    for (let i = 0; i < rows.length; i++) {
        if (rows[i] != '\n' && rows[i] != '') {
            gate_count++;
        }
    }
    if (re_result && gate_count > 0 && gate_count == re_result.length) {
        let is_valid = true;
        let size = -1;
        for (let i = 0; i < rows.length; i++) {
            if (rows[i] != '\n' && rows[i] != '') {
                if (size < 0) {
                    size = rows[i].length;
                } else {
                    if (size != rows[i].length) {
                        is_valid = false;
                    }
                }
            }
        }
        if (is_valid) {
            get_result(data, gate_count);
        } else {
            reset(false);
            document.getElementById('invalid_circuit').innerHTML = 'Illegal input';
        }
    } else {
        reset(false);
        document.getElementById('invalid_circuit').innerHTML = 'Illegal input';
    }
}

function reset(clr_input) {
    if (clr_input) {
        document.getElementById('circuit').value = '';
    }
    document.getElementById('info').innerHTML = 'Gate count: ';
    document.getElementById('truth_table').value = '';
    document.getElementById('invalid_circuit').innerHTML = '';
    let c = document.getElementById("svg_diagram");
    c.innerHTML = '';
    c.setAttribute("width", 0);
    c.setAttribute("height", 0);
    document.getElementById("btn_save").setAttribute("disabled", "");
}

document.querySelector("#btn_save").onclick = function () {
    svgExport.downloadPng(document.querySelector("#svg_diagram"), "circuit diagram");
};
