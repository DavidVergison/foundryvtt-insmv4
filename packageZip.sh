#!/bin/bash

zip -r ins-mv.zip . -x "*.git*" "node_modules/*" "tools/*" "foundry/*" "package-lock.json" "package.json" "jsconfig.json" "foundry-config.yaml"