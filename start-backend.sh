#!/usr/bin/env bash
cd "$(dirname "$0")/backend"
php spark serve --host 127.0.0.1 --port 8080
