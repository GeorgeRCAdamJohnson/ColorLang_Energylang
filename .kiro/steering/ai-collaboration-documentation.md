---
inclusion: manual
---

# AI Collaboration Documentation Guidelines

## Purpose
This steering document provides guidance for documenting and showcasing AI-assisted development practices throughout the energy research projects.

## Key AI Collaboration Examples to Highlight

### Multi-Persona Review Process
- **Security-Focused Persona**: Evaluated attack surface and data exfiltration concerns
- **Operations-Focused Persona**: Assessed deployment and maintenance complexity
- **Legal/Compliance Persona**: Identified regulatory and liability risks
- **Product/Business Persona**: Analyzed market fit and adoption barriers

### Sophisticated AI Usage Patterns
1. **Prompt Engineering**: Context-rich prompts with desired output formats
2. **Verification Workflows**: Unit tests, integration tests, human review checklists
3. **Boilerplate Generation**: AI for scaffolding, humans for architectural decisions
4. **Security Practices**: Never paste secrets, use sanitized templates

### Domain-Specific AI Applications

#### EnergyLang Project
- **Code Generation**: Cross-language benchmark implementations
- **Analysis**: Energy measurement canonicalization and auditing
- **Documentation**: Technical explanations of profiler race conditions
- **Problem-Solving**: File-sentinel handshake solution development

#### ColorLang Project
- **Language Design**: HSV color space mapping algorithms
- **Architecture**: VM and parser component design
- **Visual Programming**: Spatial sampling technique development
- **Compression Framework**: Color-encoded instruction optimization

## Documentation Best Practices

### Before/After Examples
- **Show AI Improvements**: Code quality, analysis depth, documentation clarity
- **Highlight Human Oversight**: Where human judgment was essential
- **Demonstrate Iteration**: How AI suggestions were refined through feedback

### Concrete Implementation Examples
```markdown
**AI Prompt Example**:
"Patch `tools/import_benchmark_runs_log_to_db.py` to add idempotency by computing `run_hash` from `source+benchmark+iteration` and skip inserts when present; add unit tests that assert duplicate runs are ignored."

**Human Verification**:
1. Unit tests pass
2. Integration test with disposable Postgres
3. Code review for edge cases
```

### Lessons Learned Documentation
- **What Worked**: Specific AI assistance that accelerated development
- **What Didn't**: Where AI suggestions needed significant human correction
- **Best Practices**: Reproducible patterns for future AI collaboration

## Strategic Decision-Making with AI

### Evidence-Based Research
- **Provider Analysis**: AI-assisted research of hyperscaler sustainability pages
- **Community Research**: Green Software Foundation materials analysis
- **Tool Evaluation**: WattTime, ElectricityMap integration assessment
- **Risk Assessment**: Legal, operational, and trust consideration compilation

### Decision Documentation Format
```markdown
**Decision**: [Brief description]
**AI Research Conducted**: [Specific sources and analysis]
**Human Verification**: [Stakeholder interviews, expert consultation]
**Outcome**: [Final decision and rationale]
**Preserved Value**: [What was learned/kept despite pivot]
```

## Presentation Guidelines for Website

### Interactive Examples
- **Code Diff Viewers**: Show AI-generated vs final implementations
- **Decision Trees**: Visual representation of AI-assisted analysis
- **Process Flows**: How AI and human collaboration worked in practice

### Credibility Indicators
- **Specific Tools**: Name actual AI models and versions used
- **Measurable Outcomes**: Quantify time saved, quality improvements
- **Honest Assessment**: Include failures and limitations
- **Reproducible Methods**: Provide templates others can use

### Professional Context
- **Industry Relevance**: How these practices apply to professional development
- **Scalability**: Lessons for team-based AI collaboration
- **Future Applications**: How these methods could evolve
- **Ethical Considerations**: Responsible AI usage in research and development