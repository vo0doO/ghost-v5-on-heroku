#!/usr/bin/env bash
# -*- coding: utf-8 -*-


GHOST_CLI_SITE="https://github.com/TryGhost/Ghost-CLI"

if ! [[ -x "$(command -v ghost)" ]]; then
    echo "Должен быть установлен Ghost cli: $GHOST_CLI_SITE";
    git clone $GHOST_CLI_SITE /opt/app/;
fi

# cd "$(builtin cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)/../"

# if [[ $# -ne 1 ]]; then
#     echo -e "Must provide the name of the Whoogle instance to regenerate"
#     exit 1
# fi

# APP_NAME="$1"

# ghost apps:destroy "$APP_NAME" --confirm "$APP_NAME"
# ghost apps:create "$APP_NAME"
# ghost container:login
# ghost container:push web
# ghost container:release web