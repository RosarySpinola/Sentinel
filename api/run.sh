#!/bin/bash

# Environment variables for Move Prover
export DOTNET_ROOT="/opt/homebrew/opt/dotnet@8/libexec"
export PATH="$PATH:/Users/gabrielantonyxaviour/.dotnet/tools"
export BOOGIE_EXE="/Users/gabrielantonyxaviour/.dotnet/tools/boogie"
export Z3_EXE="/opt/homebrew/bin/z3"

# Run the API
./target/release/sentinel-api
