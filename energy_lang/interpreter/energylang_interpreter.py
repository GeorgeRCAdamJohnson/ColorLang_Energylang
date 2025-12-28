"""
EnergyLang Minimal Interpreter (Proof-of-Concept)
Implements the minimal subset as defined in minimal_energylang_spec.md.
"""

import sys

class EnergyLangInterpreter:
    def __init__(self):
        self.variables = {}

    def execute(self, program_lines):
        for line in program_lines:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            if line.startswith('print '):
                expr = line[len('print '):]
                print(self.eval_expr(expr))
            elif '=' in line:
                var, expr = line.split('=', 1)
                var = var.strip()
                value = self.eval_expr(expr.strip())
                self.variables[var] = value
            else:
                raise SyntaxError(f"Unknown statement: {line}")

    def eval_expr(self, expr):
        # Only allow variable names, integers, +, -, *, /
        allowed = set('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_+-*/ ()')
        if not set(expr) <= allowed:
            raise ValueError("Invalid characters in expression")
        try:
            return eval(expr, {"__builtins__": None}, self.variables)
        except Exception as e:
            raise ValueError(f"Error evaluating expression '{expr}': {e}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python energylang_interpreter.py <program.energylang>")
        sys.exit(1)
    with open(sys.argv[1], 'r') as f:
        program = f.readlines()
    interpreter = EnergyLangInterpreter()
    interpreter.execute(program)
