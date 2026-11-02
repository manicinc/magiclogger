#!/usr/bin/env bash
# Builds the documentation site into website/build: the library, the TypeDoc API pages and the
# Docusaurus site. .github/workflows/docs-build.yml runs it on pull requests and deploys
# nothing; the deploy-docs job of ci.yml and .github/workflows/deploy-docs.yml run it on master
# and then publish website/build to gh-pages. With the commands in one place, the pull-request
# check builds the site the way the deploys do, and docs-build.yml watches this file.
#
# Run it from the repository root. pnpm-workspace.yaml lists website, so the one install puts
# the site's dependencies in place too, and website/docusaurus.config.ts reads the pages from
# docs/ where they are. GA_TRACKING_ID and MS_CLARITY_ID, when the caller sets them, reach the
# Docusaurus build.
set -euo pipefail

echo "::group::Install dependencies"
pnpm install --frozen-lockfile
echo "::endgroup::"

echo "::group::Build the library"
NODE_ENV=production pnpm run build
echo "::endgroup::"

echo "::group::Generate the API documentation"
pnpm run docs:api
echo "::endgroup::"

echo "::group::Build the Docusaurus site"
(cd website && NODE_ENV=production pnpm run build)
echo "::endgroup::"
