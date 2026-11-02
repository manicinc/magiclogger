#!/usr/bin/env bash
# The Resolve step of .github/workflows/lockfile.yml: writes pnpm-lock.yaml from the manifests,
# and with UPDATE set, moves the packages it names to the highest version their dependents
# allow. UPDATE is the workflow's update input: package names or patterns, separated by spaces.
#
# --lockfile-only writes pnpm-lock.yaml without node_modules or scripts, and pnpm drops its
# frozen-lockfile default on CI for it. A recursive command skips the workspace root, the
# library itself, unless --include-workspace-root is given (pnpm 10.14 recursive.ts only
# installs a root it was not given), and --depth Infinity asks pnpm update for matches at every
# level of dependencies. --no-save keeps the specifiers in package.json.
set -euo pipefail

UPDATE="${UPDATE:-}"

case "$UPDATE" in
  *[!a-zA-Z0-9@/._*\ -]*)
    echo "::error::update takes package names and patterns separated by spaces"
    exit 1
    ;;
esac

# The patterns go to pnpm as written, never expanded against the checkout's files.
set -f
# shellcheck disable=SC2206
names=($UPDATE)

# An input of spaces alone names nothing, and pnpm update with no name updates every package.
if [ "${#names[@]}" -eq 0 ]; then
  exec pnpm install --lockfile-only
fi

# pnpm would read a word that starts with a dash as an option: --latest moves packages past
# the ranges package.json declares (pnpm.io/cli/update), and --no-save leaves that unrecorded.
for name in "${names[@]}"; do
  case "$name" in
    -*)
      echo "::error::update takes package names and patterns, not options: $name"
      exit 1
      ;;
  esac
done

exec pnpm update --recursive --include-workspace-root --depth Infinity --no-save \
  --lockfile-only "${names[@]}"
