"""
EnergyLang Minimal Parser
Converts EnergyLang source code (text) into VM instructions.
"""
import re
from typing import List, Dict, Any

def parse_energylang_source(source: str) -> List[Dict[str, Any]]:
    instructions = []
    lines = source.splitlines()
    for line in lines:
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        if line.startswith('print '):
            expr = line[len('print '):].strip()
            instructions.append({'op': 'PRINT', 'expr': expr})
        elif '=' in line:
            var, expr = line.split('=', 1)
            instructions.append({'op': 'ASSIGN', 'var': var.strip(), 'expr': expr.strip()})
        elif line == 'halt':
            instructions.append({'op': 'HALT'})
        else:
            raise SyntaxError(f"Unknown statement: {line}")
    return instructions

if __name__ == "__main__":
    # Example usage
    src = """
    x = 2 + 3
    print x
    halt
    """
    instrs = parse_energylang_source(src)
    for i in instrs:
        print(i)
