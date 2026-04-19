#!/bin/bash

# Plugin name provided as the first argument
PLUGIN_NAME=$1

# 1. Check if argument is provided
if [ -z "$PLUGIN_NAME" ]; then
    echo "[ERROR] No plugin name provided. Usage: ./remove_plugin.sh plugin-name"
    exit 1
fi

# 2. Define target paths
BASE_DIR=".."
APP_PATH="$BASE_DIR/src/app/plugins/$PLUGIN_NAME"
ASSETS_PATH="$BASE_DIR/src/assets/$PLUGIN_NAME"

# Convert to absolute paths for the confirmation message (cleaner for the user to read)
ABS_APP_PATH=$(readlink -f "$APP_PATH")
ABS_ASSETS_PATH=$(readlink -f "$ASSETS_PATH")

# 3. Check if plugin exists at all
if [ ! -d "$APP_PATH" ] && [ ! -d "$ASSETS_PATH" ]; then
    echo "[ERROR] Plugin '$PLUGIN_NAME' not found in app/plugins or src/assets."
    exit 1
fi

# 4. Ask for confirmation
echo "You are about to delete the following folders:"
echo "  -> $ABS_APP_PATH"
echo "  -> $ABS_ASSETS_PATH"
echo ""
read -p "Are you sure? (y/n): " CONFIRM

if [[ $CONFIRM != "y" && $CONFIRM != "Y" ]]; then
    echo "Operation cancelled."
    exit 0
fi

# 5. Delete the folders
echo "Removing plugin files..."

if [ -d "$APP_PATH" ]; then
    rm -rf "$APP_PATH"
    echo "Deleted app components."
fi

if [ -d "$ASSETS_PATH" ]; then
    rm -rf "$ASSETS_PATH"
    echo "Deleted assets."
fi

echo "------------------------------------------"
echo "[SUCCESS] Plugin '$PLUGIN_NAME' has been removed."