#!/bin/sh

echo ">> Building index"

near-sdk-js build src/index.ts build/swap.wasm
