#!/bin/bash

# Environment variables for Move Prover
export DOTNET_ROOT="/opt/homebrew/opt/dotnet@8/libexec"
export PATH="$PATH:/Users/gabrielantonyxaviour/.dotnet/tools"
export BOOGIE_EXE="/Users/gabrielantonyxaviour/.dotnet/tools/boogie"
export Z3_EXE="/Users/gabrielantonyxaviour/.local/z3-4.11.2/bin/z3"

# Port configuration (default for frontend compatibility)
export PORT="${PORT:-4004}"

# Run the API
./target/release/sentinel-api
