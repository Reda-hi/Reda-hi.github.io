---
name: "testsprite-mcp"
description: "Integrates TestSprite MCP for website testing. Invoke when the user asks to set up or run TestSprite MCP tests."
---

# TestSprite MCP

Use this skill to plan, run, and interpret TestSprite MCP-driven website tests for this repo.

## When to invoke
- User asks to integrate or configure TestSprite MCP.
- User asks to run automated UI tests against the website.
- User wants help validating flows after changes.

## Prerequisites
- TestSprite MCP server is installed and running in the environment.
- MCP connection is configured and available to the agent.

## What to do
1. Identify target pages or flows to test.
2. Define test scenarios and expected outcomes.
3. Run TestSprite MCP tests against the live preview or deployed site.
4. Summarize results and propose fixes for any failures.

## Output format
- Provide a short summary of test coverage and results.
- List failed cases with reproduction steps.
- Suggest code changes when failures are actionable.
