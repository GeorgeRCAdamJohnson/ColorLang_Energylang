---
inclusion: always
---

# AI Development Methodology

## Core AI Collaboration Principles

### Begin with the End in Mind - Define Success Before Starting
- **Clear Success Criteria**: Define what "done" looks like before beginning any AI collaboration
- **User Outcome Focus**: Start with the end user experience and work backwards to technical implementation
- **Measurable Goals**: Establish specific, quantifiable metrics for success (performance, usability, functionality)
- **Exit Conditions**: Know when to stop iterating and ship the solution
- **Value Alignment**: Ensure every AI-assisted task contributes to the overall project goals and user value

### Avoid Sprawl - Maintain Focus and Direction
- **Single Feature Focus**: Work on one feature at a time, complete it fully before moving to the next
- **Clear Scope Definition**: Define specific, measurable outcomes for each AI collaboration session
- **Iterative Refinement**: Make small, focused improvements rather than attempting large, sweeping changes
- **Documentation First**: Document decisions and rationale to prevent revisiting the same questions

### Apply Rigor - Systematic and Evidence-Based Approach
- **Verification Workflows**: Every AI suggestion must pass through verification (unit tests, integration tests, human review)
- **Evidence-Based Decisions**: Support all architectural and design choices with concrete evidence and reasoning
- **Reproducible Processes**: Create templates and checklists that can be reused across similar tasks
- **Quality Gates**: Establish clear criteria for accepting or rejecting AI-generated solutions

### Challenge Self - Question Assumptions and Explore Alternatives
- **Multi-Persona Reviews**: Use different AI personas to challenge decisions from various perspectives
- **Devil's Advocate**: Actively seek out potential problems and edge cases in proposed solutions
- **Alternative Exploration**: Generate multiple approaches before settling on a solution
- **Assumption Validation**: Explicitly test and validate underlying assumptions before proceeding

### Adopt Personas - Context-Appropriate Perspectives
- **Security Persona**: Evaluate attack vectors, data privacy, and security implications
- **Performance Persona**: Focus on optimization, scalability, and resource efficiency  
- **User Experience Persona**: Prioritize usability, accessibility, and user journey
- **Maintainability Persona**: Consider long-term code health, documentation, and team handoff
- **Business Persona**: Assess market fit, adoption barriers, and strategic alignment

### Customer First - User-Centric Development
- **User Story Validation**: Ensure every feature serves a real user need
- **Accessibility Priority**: Design for all users, including those with disabilities
- **Performance Impact**: Consider how changes affect user experience and loading times
- **Progressive Enhancement**: Build core functionality first, enhance with advanced features

## AI Collaboration Workflow

### 1. Vision and Success Definition Phase
```markdown
**Persona**: Product Visionary
**Focus**: Define the end state and success criteria before any technical work
**Questions to Ask**:
- What is the ideal user experience we're creating?
- How will users measure the value of this feature?
- What does "done" look like from a user perspective?
- What metrics will indicate we've succeeded?
- How does this contribute to the overall project goals?
```

### 2. Problem Definition Phase
```markdown
**Persona**: Product Manager
**Focus**: Define clear user needs and success criteria based on the established vision
**Questions to Ask**:
- What specific user problem does this solve?
- How does this align with our defined end state?
- What are the acceptance criteria that prove we've achieved our vision?
- What assumptions are we making about user behavior?
```

### 3. Technical Design Phase
```markdown
**Persona**: Software Architect
**Focus**: System design and technical approach
**Questions to Ask**:
- What are the technical constraints and requirements?
- How does this integrate with existing systems?
- What are the performance implications?
- What are potential failure modes?
```

### 4. Security Review Phase
```markdown
**Persona**: Security Engineer
**Focus**: Security implications and risk assessment
**Questions to Ask**:
- What are the attack vectors?
- How is sensitive data handled?
- What are the privacy implications?
- Are there compliance requirements?
```

### 5. Implementation Phase
```markdown
**Persona**: Senior Developer
**Focus**: Code quality and best practices
**Questions to Ask**:
- Is the code maintainable and testable?
- Are we following established patterns?
- What edge cases need handling?
- How will this be debugged in production?
```

### 6. User Experience Review Phase
```markdown
**Persona**: UX Designer
**Focus**: User interaction and accessibility
**Questions to Ask**:
- Is the interface intuitive and accessible?
- How does this fit into the user journey?
- What happens when things go wrong?
- Is the experience consistent across devices?
```

## Prompt Engineering Standards

### Context-Rich Prompts
- **Background Information**: Provide relevant project context and constraints
- **Specific Requirements**: Include exact specifications and acceptance criteria
- **Expected Output Format**: Specify desired code structure, documentation format, or deliverable type
- **Quality Criteria**: Define what constitutes a successful solution

### Example Prompt Template
```markdown
**Context**: Building a React component for energy benchmark visualization
**Requirements**: 
- Display interactive charts with filtering capabilities
- Support multiple chart types (bar, scatter, line)
- Maintain accessibility standards (WCAG 2.1 AA)
- Handle loading states and error conditions

**Expected Output**:
- TypeScript React component with proper interfaces
- Unit tests with React Testing Library
- Accessibility attributes and keyboard navigation
- Error boundary implementation

**Quality Criteria**:
- Code passes ESLint and TypeScript checks
- Tests achieve >90% coverage
- Component is reusable and well-documented
```

## Verification and Quality Assurance

### Three-Layer Verification
1. **Automated Testing**: Unit tests, integration tests, property-based tests
2. **Code Review**: Human review of AI-generated code for logic and maintainability
3. **User Testing**: Validation that the solution actually solves the user problem

### AI Output Evaluation Checklist
- [ ] **Functionality**: Does it work as specified?
- [ ] **Quality**: Is the code clean, readable, and maintainable?
- [ ] **Performance**: Does it meet performance requirements?
- [ ] **Security**: Are there any security vulnerabilities?
- [ ] **Accessibility**: Is it accessible to all users?
- [ ] **Testing**: Is it properly tested with good coverage?
- [ ] **Documentation**: Is it well-documented for future maintenance?

## Decision Documentation

### Technical Decision Records (TDRs)
For significant technical decisions, document:
- **Context**: What situation led to this decision?
- **Options Considered**: What alternatives were evaluated?
- **Decision**: What was chosen and why?
- **Consequences**: What are the implications of this choice?
- **AI Involvement**: How did AI assist in the decision-making process?

### AI Collaboration Log
Track AI usage patterns and effectiveness:
- **Task Type**: What kind of work was AI used for?
- **Persona Used**: Which perspective was adopted?
- **Quality of Output**: How much human refinement was needed?
- **Time Saved**: How much faster was the task completed?
- **Lessons Learned**: What worked well or poorly?

## Best Practices for Specific Tasks

### Code Generation
- **Start with Interfaces**: Define TypeScript interfaces before implementation
- **Test-Driven Approach**: Write tests first, then generate implementation
- **Incremental Development**: Build in small, testable pieces
- **Human Review Required**: Never merge AI-generated code without review

### Documentation Writing
- **User-Focused**: Write for the intended audience, not just developers
- **Example-Rich**: Include concrete examples and use cases
- **Maintainable**: Structure for easy updates as code evolves
- **Accessible**: Use clear language and proper formatting

### Problem Solving
- **Break Down Complex Problems**: Divide into smaller, manageable pieces
- **Multiple Solution Paths**: Generate several approaches before choosing
- **Edge Case Consideration**: Explicitly think through failure scenarios
- **Performance Impact**: Consider scalability and resource usage

## Continuous Improvement

### Regular Retrospectives
- **What AI approaches worked well?**
- **Where did AI suggestions need significant correction?**
- **How can we improve our prompting techniques?**
- **What new personas or perspectives should we adopt?**

### Knowledge Sharing
- **Document Successful Patterns**: Create reusable templates and approaches
- **Share Lessons Learned**: Build institutional knowledge about effective AI collaboration
- **Update Methodologies**: Refine processes based on experience and outcomes