# AI Persona Review Template

Purpose
- Provide a repeatable template for running multiple AI persona reviews early in a project. Use this before committing to major architectural pivots, vendor engagements, or high-risk operational changes.

How to run
-----------
1. Pick 3–4 personas relevant to the decision (example: Security, Ops, Legal/Compliance, Product/PO).  
2. For each persona, run a short prompt that includes: context, the decision or proposal, constraints, and the desired output format (e.g., "Top 5 risks and suggested mitigations").  
3. Record persona outputs into `projects/energy_orchestrator_archive/raw/ai_persona_reviews/` as one file per persona.  
4. Have a human reviewer (owner) reconcile and extract the top 3 actions and open any follow-up tickets.

Persona prompt template
----------------------
Use this skeleton and adapt for each persona. Replace square brackets.

"You are a [PERSONA] with expertise in [domain]. Review the following proposal and provide:

- A short (3–6 bullet) summary of top risks or concerns from your perspective.
- 3 suggested mitigations or requirement changes to lower the risk.
- Any follow-up questions that should be asked of stakeholders.
- A confidence estimate (High/Medium/Low) and any sources or assumptions.

Proposal:
[Paste the 3–5 sentence proposal or decision summary here.]

Constraints:
- [List hard constraints: e.g., no provider-side code mutation, must preserve customer data privacy, target runtime, etc.]

Desired output format: Provide results as a small JSON object with keys: `persona`, `summary`, `risks`, `mitigations`, `follow_up_questions`, `confidence`, `sources`.
"

Example persona list and focus
-----------------------------
- Security: data leakage, attack surface, runtime sandboxing, supply-chain risk.
- Operations/Ops: deployment complexity, observability, rollback, support burden.
- Legal/Compliance: liability, contractual risk, GDPR/privacy concerns, export controls.
- Product / PO: developer experience, adoption friction, UX, metrics of success.

Storage & naming
----------------
- Save each persona output as `projects/energy_orchestrator_archive/raw/ai_persona_reviews/<YYYYMMDD>-<decision>-<persona>.json`.
- Include the exact prompt used, the raw AI output, and a short human summary.

Human verification checklist
---------------------------
- [ ] Confirm no secrets or credentials were included in prompts.
- [ ] Ensure each persona output has at least one concrete mitigation suggestion.
- [ ] Assign an owner for follow-up questions and tickets.
- [ ] Link persona outputs to the decision TDR (e.g., add a reference in `docs/tdr/<id>.md`).

Example run (PowerShell)
-------------------------
Save the prompt to a file and run your chosen AI client. Example command structure is intentionally generic — adapt to your tooling:

```powershell
# 1) create prompt file
Set-Content -Path .\tmp\prompt.txt -Value '...'
# 2) run AI client (pseudo):
ai-client --prompt-file .\tmp\prompt.txt --out .\projects\energy_orchestrator_archive\raw\ai_persona_reviews\20251122-decision-ops.json
```

Notes & best practices
----------------------
- Never treat AI persona output as a decision — treat it as structured input to inform human decisions.
- Use multiple personas to broaden coverage — different personas will surface different classes of risk.
- Keep persona prompts short and focused: 3–5 sentences of context and an explicit output format.
- Sanitize inputs: replace or mask any secrets or customer data before sending prompts.

Next steps: Create a repo template `tools/ai_persona_prompts/` containing sample persona prompts and a small script `tools/run_ai_personas.ps1` that helps package prompts and store outputs.
