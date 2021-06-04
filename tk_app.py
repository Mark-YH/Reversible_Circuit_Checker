# coding: UTF-8
"""
Created on 2021/6/4

@author: Mark Hsu
"""

from tkinter import ttk
import tkinter as tk
from sys import platform
from checker import Circuit


def layout_config(obj, column=0, row=0, col_minsize=None, row_minsize=None):
    if col_minsize is None:
        obj.columnconfigure(column, weight=1)
    else:
        obj.columnconfigure(column, weight=1, minsize=col_minsize)
    if row_minsize is None:
        obj.rowconfigure(row, weight=1)
    else:
        obj.rowconfigure(row, weight=1, minsize=row_minsize)


def clear_text(obj, text, lbl_info, canvas):
    if type(obj) == list or type(obj) == tuple:
        for o in obj:
            o.delete(1.0, "end")
            o.insert(1.0, text)
    else:
        obj.delete(1.0, "end")
        obj.insert(1.0, text)
    lbl_info.config(text='Total gate: 0')
    canvas.delete("all")


def retrieve_input(obj_input, obj_table, lbl_info, canvas, is_binary=True):
    circuit = obj_input.get('1.0', 'end-1c').replace(' ', '')
    rows = circuit.split('\n')
    for item in rows:
        if item == '' or item == '\n':
            continue
        else:
            c = Circuit(len(item))
            break
    count = 0
    for row in rows:
        if row == '' or row == '\n':
            continue
        else:
            c.add(row)
            count += 1
    i, o = c.get_truth_table()
    obj_table.delete(1.0, "end")
    for k in range(pow(2, c.size)):
        if is_binary:
            obj_table.insert("end-1c", i[k] + ' -> ' + o[k] + '\n')
        else:
            obj_table.insert("end-1c", str(int(i[k], 2)) + ' -> ' + str(int(o[k], 2)) + '\n')
    lbl_info.config(text='Total gate: {}'.format(count))

    canvas.delete("all")
    for k in range(c.size):
        x = 50
        y = 25
        canvas.create_line(x, y + k * 50, x + 50 * len(c.circuit), y + k * 50)
    max_height = c.size * 50 - 10
    max_width = len(c.circuit) * 50 + 100
    canvas.config(scrollregion=(0, 0, max_width, max_height))

    for k, gate in enumerate(c.circuit):
        x = 50 + 50 * k + 20
        canvas.create_line(x + 5, 25, x + 5, c.size * 50 - 25)
        for l, bit in enumerate(gate):
            y = 20 + l * 50
            if bit == '0':
                canvas.create_oval(x, y, x + 10, y + 10, fill='white', width=1.5)
            elif bit == '1':
                canvas.create_oval(x, y, x + 10, y + 10, fill='black', width=1.5)
            elif bit == '2':
                _x = x - 5
                _y = y - 5
                canvas.create_oval(_x, _y, _x + 20, _y + 20, fill='white', width=1.5)
                canvas.create_line(_x, _y + 10, _x + 20, _y + 10, width=1.5)
                canvas.create_line(_x + 10, _y, _x + 10, _y + 20, width=1.5)


def app():
    window = tk.Tk()
    window.title('Quantum circuit')
    window.geometry('800x600')
    window.minsize(800, 600)
    pad = 5

    style = ttk.Style()
    if platform == "linux" or platform == "linux2":
        style.theme_use('alt')
    elif platform == "darwin":
        style.theme_use('clam')
    elif platform == "win32":
        style.theme_use('winnative')

    # style.configure('top.TFrame', font='helvetica 12', foreground='red', background='green')
    # style.configure('bottom.TFrame', font='helvetica 12', foreground='red', background='red')
    # style.configure('left.TFrame', font='helvetica 12', foreground='red', background='blue')
    # style.configure('center.TFrame', font='helvetica 12', foreground='red', background='yellow')
    # style.configure('right.TFrame', font='helvetica 12', foreground='red', background='orange')

    top = ttk.Frame(window, width=600, height=30, style='top.TFrame')
    bottom = ttk.Frame(window, width=600, height=300, style='bottom.TFrame')
    top.pack(fill='both', side='top', expand=True, padx=pad, pady=pad)
    bottom.pack(fill='both', side='bottom', expand=True, padx=pad, pady=pad)
    canvas_box_frame = ttk.Frame(bottom)
    canvas_box_frame.pack(fill='both', expand=True)
    canvas = tk.Canvas(canvas_box_frame)
    canvas.pack(fill='both', side='left', expand=True)
    vs_canvas = ttk.Scrollbar(canvas_box_frame, orient="vertical", command=canvas.yview)
    hs_canvas = ttk.Scrollbar(bottom, orient="horizontal", command=canvas.xview)
    vs_canvas.pack(side='left', fill='y')
    hs_canvas.pack(fill='x')
    canvas.config(xscrollcommand=hs_canvas.set, yscrollcommand=vs_canvas.set)

    button_frame = ttk.Frame(top, width=100, height=100, style='left.TFrame')
    input_frame = ttk.Frame(top, width=200, height=100, style='center.TFrame')
    table_frame = ttk.Frame(top, width=300, height=200, style='right.TFrame')
    button_frame.pack(fill='both', side='left', expand=False, padx=pad, pady=pad)
    input_frame.pack(fill='both', side='left', expand=True, padx=pad, pady=pad)
    table_frame.pack(fill='both', side='left', expand=True, padx=pad, pady=pad)

    bt_decimal = ttk.Button(button_frame, text='Decimal', style='TButton',
                            command=lambda: retrieve_input(txt_input, txt_table, lbl_info, canvas, is_binary=False))
    bt_binary = ttk.Button(button_frame, text='Binary', style='TButton',
                           command=lambda: retrieve_input(txt_input, txt_table, lbl_info, canvas))
    bt_clear = ttk.Button(button_frame, text='Clear', style='TButton',
                          command=lambda: clear_text((txt_table, txt_input), "", lbl_info, canvas))
    bt_decimal.pack(expand=True, padx=pad, pady=pad)
    bt_binary.pack(expand=True, padx=pad, pady=pad)
    bt_clear.pack(expand=True, padx=pad, pady=pad)
    lbl_info = ttk.Label(button_frame, text='Total gate: ', style='TLabel')
    lbl_info.pack(fill='x', expand=False, padx=pad, pady=pad)

    lbl_input = ttk.Label(input_frame, text='Input your circuit', style="TLabel")
    lbl_input.pack(padx=pad, pady=pad)
    input_box_frame = ttk.Frame(input_frame)
    input_box_frame.pack(fill='both', expand=True)
    txt_input = tk.Text(input_box_frame, wrap='none', width=21, height=10)
    txt_input.pack(fill='both', side='left', expand=True)
    vs_input = ttk.Scrollbar(input_box_frame, orient="vertical", command=txt_input.yview)
    hs_input = ttk.Scrollbar(input_frame, orient="horizontal", command=txt_input.xview)
    vs_input.pack(side='left', fill='y')
    hs_input.pack(fill='x')
    txt_input.config(xscrollcommand=hs_input.set, yscrollcommand=vs_input.set)

    lbl_table = ttk.Label(table_frame, text='Truth table', style="TLabel")
    lbl_table.pack(padx=pad, pady=pad)
    table_box_frame = ttk.Frame(table_frame)
    table_box_frame.pack(fill='both', expand=True)
    txt_table = tk.Text(table_box_frame, wrap='none', width=51, height=10)
    txt_table.pack(fill='both', side='left', expand=True)
    vs_table = ttk.Scrollbar(table_box_frame, orient="vertical", command=txt_table.yview)
    hs_table = ttk.Scrollbar(table_frame, orient="horizontal", command=txt_table.xview)
    vs_table.pack(side='left', fill='y')
    hs_table.pack(fill='x')
    txt_table.config(xscrollcommand=hs_table.set, yscrollcommand=vs_table.set)

    window.mainloop()


if __name__ == '__main__':
    app()
