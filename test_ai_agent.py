#!/usr/bin/env python3

import sys
import os
sys.path.append('.')

from colorlang.color_parser import ColorParser
from colorlang.virtual_machine import ColorVM
import json

def test_ai_agent():
    print("Testing AI Job-Finding Agent ColorLang Program")
    print("=" * 50)
    
    # Load metadata
    with open("job_agent_metadata.json", "r") as f:
        metadata = json.load(f)
    
    print(f"Expected Instructions: {metadata['total_instructions']:,}")
    
    # Parse the program
    parser = ColorParser()
    program = parser.parse_image("intelligent_job_agent_1920x1080.png")
    
    print(f"Actual Instructions Parsed: {len(program['instructions']):,}")
    
    # Count instruction types
    instruction_types = {}
    for instruction in program['instructions']:
        instr_type = instruction['type']
        instruction_types[instr_type] = instruction_types.get(instr_type, 0) + 1
    
    print("\nInstruction Types:")
    for instr_type, count in sorted(instruction_types.items()):
        print(f"  {instr_type}: {count:,}")
    
    # Test with VM
    print("\nTesting with ColorLang VM...")
    vm = ColorVM()
    result = vm.run_program(program)
    
    print("SUCCESS! AI Agent ColorLang program executed!")
    print(f"This demonstrates ColorLang can encode {len(program['instructions']):,} AI instructions as HSV pixels!")

if __name__ == "__main__":
    test_ai_agent()