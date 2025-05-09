#!/bin/sh
rm -f dist/*
rm -f wheels/*
rm *.vsix
npm run vscode:prepublish
yes | vsce package

