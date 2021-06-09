from flask import Flask, render_template, request

from lib.circuit import Circuit

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/start', methods=['post'])
def start():
    if request.method == 'POST':
        try:
            ret = request.get_json()['circuit']
            ret = str(ret).replace(' ', '')
            rows = ret.split('\n')
            for row in rows:
                if row != '\n' and row != '':
                    wire = len(row)
            c = Circuit(wire)
            for row in rows:
                if row != '\n' and row != '':
                    c.add(row)
            in_table, out_table = c.get_truth_table()
            return {'success': 'true', 'data': {'input': in_table, 'output': out_table}}
        except Exception as e:
            print({'success': 'false', 'message': e})
            return {'success': 'false', 'message': e}


if __name__ == '__main__':
    app.run()
