#!/bin/bash
cd /home/kavia/workspace/code-generation/minesweeper-classic-95082-95089/mine_sweeper
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

