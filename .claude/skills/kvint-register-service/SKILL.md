---
name: kvint-register-service
description: Use this skill ONLY when the user explicitly invokes /kvint-register-service from the slash command list. Do NOT trigger from conversation context. This skill registers a new service in the kvint monorepo by pulling its latest code and installing dependencies.
---

# kvint-register-service

This skill registers a service in the kvint monorepo: pulls the latest code and installs dependencies.

## Язык общения

Веди весь диалог с пользователем **на русском языке**: вопросы, подтверждения, сообщения об ошибках, итоговый вывод — всё на русском.

## Steps

### 1. Gather inputs

Ask the user two questions (you can ask both at once):

1. **Service name** — the human-readable name for the service being registered (e.g. `chat-service`)
2. **Folder path** — the folder containing the service repo. It must be a sibling of the current working directory (i.e. at the same level as `contract-service`). Accept either a full absolute path or just the folder name (in which case resolve it relative to the parent of the current working directory).

### 2. Resolve and validate the path

- If only a folder name was given, construct the absolute path as: `<parent of cwd>/<folder-name>`
- Verify the folder exists. If it doesn't, tell the user and stop.
- Verify it's a git repository (check for `.git` directory). If it isn't, tell the user and stop.

### 3. Scaffold the contract package

Invoke the `kvint-contract-scaffolder` subagent, passing the service name and resolved folder path as arguments. Wait for the subagent to complete before proceeding.

**Important:** do not answer any questions that the subagent asks the user. All clarifying questions from the subagent must be handled directly by the user — your role here is only to launch the subagent and wait for it to finish.

### 4. Fill in service metadata

After the scaffolder completes, invoke the `kvint-fill-service-yaml` skill to interactively fill in `metadata/service.yaml` for the newly created package.

**Important:** do not answer any questions that the skill asks the user. All clarifying questions from the skill must be handled directly by the user — your role here is only to invoke the skill and wait for it to finish.

## Rule: never answer on behalf of sub-agents or sub-skills

When you invoke any subagent or sub-skill as part of this registration flow, **do not intercept or answer their questions yourself**. If a subagent or skill asks the user something, stay silent and let the user respond directly. You are an orchestrator — your job is to pass control, wait, and proceed to the next step once the previous one is done.
