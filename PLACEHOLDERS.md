# Placeholders

Every `{{name}}` in the template files. Fill them by hand, then run `grep -rn "[{][{]" . --exclude-dir=.git --exclude=README.md --exclude=PLACEHOLDERS.md` and expect no output. The example repository `ICM-DEV-example` (not published yet; see the README) shows each one filled in for a real project.

Not placeholders: `<id>`, `NNN`, `<slug>` and `gh api repos/{owner}/{repo}` are literal text for the agents or for `gh`. The branch name `main`, the role names `reviewer`, `reviewer-strict`, `builder` and the command `/master` are fixed; rename them everywhere with a search if you must.

| Placeholder | Where | What to write |
|---|---|---|
| `{{project_name}}` | `MASTER.md`, the loader, the agent descriptions | The project's display name |
| `{{project_summary}}` | `AGENTS.md` Project | Two or three sentences: what it is, who uses it |
| `{{stack}}` | `AGENTS.md` Project | Languages, frameworks, runtime versions |
| `{{layout_table}}` | `AGENTS.md` Project | A two-column markdown table, `Path` and `What it is` |
| `{{dev_cmd}}`, `{{build_cmd}}` | `AGENTS.md` Commands | Commands, or "none" |
| `{{lint_cmd}}` | `AGENTS.md` Commands and gates | The static check every code task runs |
| `{{unit_cmd}}`, `{{unit_one_cmd}}` | `AGENTS.md` Commands and gates | All unit tests; one test file |
| `{{e2e_cmd}}`, `{{e2e_fast_cmd}}` | `AGENTS.md` Commands and gates, stages 02 and 03 | The full end-to-end form (the reviewer runs it) and a fast form (the builder runs it) |
| `{{project_rules}}` | `AGENTS.md` Non-negotiables | One bullet per rule the type checker and linter cannot enforce |
| `{{parity_rows}}` | `AGENTS.md` parity map | Table rows: `This`, `Must match`, `Guarded by` |
| `{{gate_rows}}` | `AGENTS.md` tiered gates | Table rows: `Changed`, `Run`. One row per folder or file kind |
| `{{context_routing_rows}}` | `AGENTS.md` routing | Table rows: `Your task touches`, `Read` |
| `{{critical_paths}}` | `AGENTS.md`, stage 01 | The code where a bug costs the most: money, auth, data loss. These get a failing test first and a pause |
| `{{pause_paths}}` | `AGENTS.md` pause bullet | Other folders that make MASTER stop before the build |
| `{{production_touch_points}}` | `AGENTS.md` Stop and ask first | Bullets: what only the owner may do to anything live |
| `{{docs_only_paths}}` | `AGENTS.md` Release, `MASTER.md` | Paths that do not count as a code change for auto-merge |
| `{{text_style_rule}}` | stages 01, 02 and 03 | One sentence that reads as a Verify or Never bullet, or delete the line |
