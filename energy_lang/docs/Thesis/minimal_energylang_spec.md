# Minimal EnergyLang Subset: Proof of Concept

## Supported Features
- **Arithmetic:** add, subtract, multiply, divide
- **Variables:** assignment, integer/float types
- **Control Flow:** if, while, for
- **Functions:** definition, call, return
- **Energy Annotation:** function-level energy budget (e.g., @energy_budget(max_joules=10))
- **Simple I/O:** print, input (optional for demo)

## Example Syntax
```energylang
@energy_budget(max_joules=5)
def sum_to_n(n):
    total = 0
    for i in range(1, n+1):
        total = total + i
    return total

print(sum_to_n(100))
```

## Constraints
- Only integer/float variables
- No complex data structures (lists, dicts, etc.)
- No concurrency or parallelism in POC
- Energy annotation is enforced at function level

---

This subset is sufficient for a working proof of concept and demo, and can be extended as needed.