/**
 * Created by Mark on 2021/6/5.
 */

function draw(circuit, wire_count) {
    let rows = circuit.split('\n');
    while (rows[rows.length - 1] == '') {
        rows.pop();
    }
    let c = document.getElementById("myCanvas");
    let ctx = c.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.canvas.width = rows.length * 50 + 100;
    ctx.canvas.height = wire_count * 50;

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;

    ctx.beginPath();
    for (let i = 0; i < wire_count; i++) {
        let x = 50, y = 25;
        ctx.moveTo(x, y + i * 50);
        ctx.lineTo(x + 50 * rows.length, y + i * 50);
    }
    ctx.stroke();

    for (let i = 0; i < rows.length; i++) {
        let x = 50 + 50 * i + 20;
        ctx.beginPath();
        if (rows[i] == '') {
            console.log('i=' + i + ' ' + rows[i]);
            ctx.setLineDash([5, 5]);
            ctx.moveTo(x + 5, 13);
            ctx.lineTo(x + 5, wire_count * 50 - 10);
        } else {
            ctx.setLineDash([]);
            ctx.moveTo(x + 5, 25);
            ctx.lineTo(x + 5, wire_count * 50 - 25);
        }
        ctx.stroke();
        for (let j = 0; j < wire_count; j++) {
            let y = 20 + j * 50;
            ctx.beginPath();
            if (rows[i][j] == '0') {
                ctx.fillStyle = '#FFFFFF';
                ctx.strokeStyle = "#000000";
                ctx.arc(x + 5, y + 5, 5, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
            } else if (rows[i][j] == '1') {
                ctx.fillStyle = '#000000';
                ctx.arc(x + 5, y + 5, 5, 0, 2 * Math.PI);
                ctx.fill();
            } else if (rows[i][j] == '2') {
                let _x = x - 5;
                let _y = y - 5;
                ctx.fillStyle = '#FFFFFF';
                ctx.strokeStyle = "#000000";
                ctx.arc(x + 5, y + 5, 10, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(_x, _y + 10);
                ctx.lineTo(_x + 20, _y + 10);
                ctx.moveTo(_x + 10, _y);
                ctx.lineTo(_x + 10, _y + 20);
                ctx.stroke();
            }
        }
    }
}

function get_result(data, gate_count) {
    axios({
        method: 'post',
        url: 'https://reversible-circuit.herokuapp.com/start',
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
            draw(data, Math.log2(in_table.length));
        } else {
            document.getElementById('invalid_circuit').innerHTML = res.data['message'];
        }
    }).catch(res => {
        console.log(res.data);
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
    let c = document.getElementById("myCanvas");
    let ctx = c.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.canvas.width = 0;
    ctx.canvas.height = 0;
    console.log(document.getElementById('truth_table').cols);
}
