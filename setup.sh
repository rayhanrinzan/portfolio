#!/usr/bin/env bash
# Installs the full design / motion / QA / deploy toolchain for Claude Code.
# Run from the portfolio folder:  bash setup.sh
# Needs Node.js 20+ and Claude Code (`claude` on PATH).
# When an installer asks: choose Claude Code, project scope.

failed=()
step() { echo; echo "==> $1"; shift; "$@" || failed+=("$*"); }

# --- Design direction -------------------------------------------------------
step "Impeccable (lead design skill: craft / audit / polish + anti-slop hook)" \
  npx -y impeccable install --providers=claude --scope=project
step "Taste Skill (design-taste-frontend: second-opinion critic)" \
  npx -y skills add https://github.com/Leonxlnx/taste-skill --skill design-taste-frontend --agent claude-code
step "UI UX Pro Max (UX guideline library)" \
  npx -y skills add nextlevelbuilder/ui-ux-pro-max-skill@ui-ux-pro-max --agent claude-code
step "Anthropic example skills marketplace" \
  claude plugin marketplace add anthropics/skills
step "Anthropic example skills (frontend-design, canvas-design, algorithmic-art, webapp-testing, theme-factory...)" \
  claude plugin install example-skills@anthropic-agent-skills --scope project

# --- Motion -----------------------------------------------------------------
step "Official GSAP skills (core, timeline, plugins, performance...)" \
  npx -y skills add https://github.com/greensock/gsap-skills --agent claude-code
step "Accessible animation (reduced-motion tiers)" \
  npx -y skills add iart-ai/web-animation-skills --skill accessible-animation --agent claude-code
step "60fps animation (performance)" \
  npx -y skills add iart-ai/web-animation-skills --skill 60fps-animation --agent claude-code
step "SVG animation" \
  npx -y skills add iart-ai/web-animation-skills --skill svg-animation --agent claude-code

# --- QA: eyes, performance, accessibility ----------------------------------
step "Vercel web-design-guidelines (100+ a11y / UX rules)" \
  npx -y skills add vercel-labs/agent-skills --skill web-design-guidelines --agent claude-code
step "Playwright MCP (screenshots, interaction)" \
  claude mcp add playwright -- npx @playwright/mcp@latest
step "Chrome DevTools MCP (performance traces, Lighthouse)" \
  claude mcp add chrome-devtools -- npx chrome-devtools-mcp@latest

# --- Deploy -----------------------------------------------------------------
step "Vercel plugin (deploy / env / status commands)" \
  npx -y plugins add vercel/vercel-plugin
step "Vercel CLI" \
  npm i -g vercel

echo
if [ ${#failed[@]} -eq 0 ]; then
  echo "All installed."
else
  echo "These steps failed (re-run them by hand, or ask Claude Code to help):"
  printf '  - %s\n' "${failed[@]}"
fi

cat <<'MSG'

Next:
  1. Fill in TODOs in content/profile.md (or answer when Claude asks).
  2. Optional but the biggest upgrade: put your own drawings in art/
     (see art/README.md).
  3. Run `claude`, check /mcp and /plugin, then say:
     "Read CLAUDE.md and PLAN.md, then start Phase 0."
MSG
