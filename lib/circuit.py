# coding: UTF-8
"""
Created on 2021/6/3

@author: Mark Hsu
"""
from numpy import binary_repr


class Circuit:
    def __init__(self, m):
        self.circuit = []
        self.size = m

    def add(self, gate):
        if len(gate) != self.size:
            raise Exception('Number error')
        count = 0
        for it in gate:
            if int(it) > 3 or int(it) < 0:
                raise Exception('Input error')
            elif it == '2':
                count += 1
        if count == 1:
            self.circuit.append(gate)
        else:
            raise Exception('Gate error')

    def output_circuit(self):
        for gate in self.circuit:
            for it in gate:
                print(it, end='')
            print('')
        print('Gate number:', len(self.circuit))

    def get_truth_table(self):
        in_table = []
        out_table = []
        for it in range(pow(2, self.size)):
            in_table.append(binary_repr(it, self.size))
            out_table.append(binary_repr(it, self.size))
        for gate in self.circuit:
            for i in range(len(out_table)):
                out_table[i] = self.__apply_gate__(gate, out_table[i])
        return in_table, out_table

    def __apply_gate__(self, gate, out_row):
        is_inverse = True
        for i in range(self.size):
            if int(gate[i]) < 2 and gate[i] != out_row[i]:
                is_inverse = False
                continue
            if gate[i] == '2':
                not_bit = i
        if is_inverse:
            s = ''
            for i in range(self.size):
                if i == not_bit:
                    s += str(1 - int(out_row[not_bit]))
                else:
                    s += out_row[i]
            return s
        else:
            return out_row


'''
full adder
2010
0210
0112
0210
2100
1200
1002
1200

Input: ['0000', '0001', '0010', '0011', '0100', '0101', '0110', '0111', '1000', '1001', '1010', '1011', '1100', '1101', '1110', '1111']
Output ['0000', '0001', '1010', '0011', '1001', '0101', '0110', '0010', '1000', '1100', '0111', '1011', '0100', '1101', '1110', '1111']
'''


def run():
    size = input('Bit number:')
    c = Circuit(int(size))
    print('Input gates:')
    has_next = True
    while has_next:
        gate = input('')
        if gate == '':
            has_next = False
        else:
            c.add(gate)
    c.output_circuit()
    i, o = c.get_truth_table()
    print('Input:', i)
    print('Output:', o)


if __name__ == '__main__':
    run()
