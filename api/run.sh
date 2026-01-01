#!/bin/bash

# Move Prover Dependencies
# Required versions: Boogie 3.5.1, Z3 <= 4.11.2, .NET 8.x

# .NET runtime for Boogie
export DOTNET_ROOT="/opt/homebrew/opt/dotnet@8/libexec"

# Add dotnet tools to PATH
export PATH="$PATH:$HOME/.dotnet/tools"

# Boogie executable (version 3.5.1)
export BOOGIE_EXE="$HOME/.dotnet/tools/boogie"

# Z3 solver (version 4.11.2 - required by Move Prover)
export Z3_EXE="$HOME/.local/opt/z3-4.11.2/bin/z3"

# Verify prover dependencies exist
if [ ! -f "$BOOGIE_EXE" ]; then
    echo "WARNING: Boogie not found at $BOOGIE_EXE"
    echo "Install with: dotnet tool install --global Boogie --version 3.5.1"
fi

if [ ! -f "$Z3_EXE" ]; then
    echo "WARNING: Z3 4.11.2 not found at $Z3_EXE"
    echo "Download from: https://github.com/Z3Prover/z3/releases/tag/z3-4.11.2"
fi

# Port configuration (default for frontend compatibility)
export PORT="${PORT:-4004}"

# Run the API
./target/release/sentinel-api
