@echo off
cd /d %~dp0backend
php spark serve --host 127.0.0.1 --port 8080
