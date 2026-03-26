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

### 3. Detect the default branch

Run:
```bash
git -C "<path>" remote show origin | grep "HEAD branch"
```

Use the reported branch name (`main` or `master` or whatever it says). Fall back to `main` if the command fails.

### 4. Pull latest code

```bash
git -C "<path>" fetch origin
git -C "<path>" checkout <default-branch>
git -C "<path>" pull origin <default-branch>
```

If the pull fails, report the error and stop — don't proceed to dependency installation on broken state.

### 5. Detect package manager and install dependencies

Check for lock files in the service folder (in priority order):

| Lock file | Package manager | Install command |
|---|---|---|
| `pnpm-lock.yaml` | pnpm | `pnpm install` |
| `yarn.lock` | yarn | `yarn install` |
| `package-lock.json` | npm | `npm install` |
| `package.json` only | npm | `npm install` |

If there is no `package.json`, skip this step and mention it.

Run the install command with the working directory set to the service folder.

### 6. Show last commit info

Run:
```bash
git -C "<path>" log -1 --pretty=format:"%H%n%an <%ae>%n%ad%n%s%n%b" --date=format:"%Y-%m-%d %H:%M:%S"
```

Format the output clearly:

```
Service: <service-name>
Path:    <resolved-path>

Last commit
───────────
Hash:    <hash>
Author:  <author name> <email>
Date:    <date>
Message: <subject>
<body if present>
```

### 7. Done

Confirm to the user that the service is ready. Mention the branch it's on and the package manager used.
