# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## MOST IMPORTANT EXECUTION INSTRUCTIONS
- All communication with users must be conducted in Japanese!!
- The documents created must be in Japanese!!
- Only the content of CLAUDE.md should be written in English !!

### Development Workflow : Feature Development Process

When the user says: "continue implementing"

1) Check the contents of `docs/*.md`

2) Check the contents of `docs/progress.md`

3) Execute `.claude/commands/speckit.implement.md`

4) Update the progress to `docs/progress.md` and `specs/.../tasks.md`.