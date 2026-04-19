#!/bin/bash

# Path to the plugin candidate provided as the first argument
PLUGIN_PATH=$1

# 1. Check if argument is provided
if [ -z "$PLUGIN_PATH" ]; then
    echo "[ERROR] No path provided. Usage: ./load_plugin.sh /path/to/plugin"
    exit 1
fi

# 2. Check for areyouaplugin.conf and its content
CONF_FILE="$PLUGIN_PATH/areyouaplugin.conf"
if [ ! -f "$CONF_FILE" ] || [ "$(cat "$CONF_FILE")" != "yes" ]; then
    echo "[ERROR] 'areyouaplugin.conf' not found or content is not 'yes'. Aborting."
    exit 1
fi

# 3. Check for assets/plugin.json and extract the "name" field
JSON_FILE="$PLUGIN_PATH/assets/plugin.json"
if [ ! -f "$JSON_FILE" ]; then
    echo "[ERROR] '$JSON_FILE' not found. Aborting."
    exit 1
fi

# Extract name using grep/sed (to avoid dependency on 'jq')
PLUGIN_NAME=$(grep -oP '"name":\s*"\K[^"]+' "$JSON_FILE")

if [ -z "$PLUGIN_NAME" ]; then
    echo "[ERROR] Could not find 'name' in plugin.json."
    exit 1
fi

echo "Detected plugin name: $PLUGIN_NAME"

# 4. Define target paths relative to script location (assuming tools/ and src/ are siblings)
BASE_DIR=".."
APP_PLUGINS_DIR="$BASE_DIR/src/app/plugins"
ASSETS_PLUGINS_DIR="$BASE_DIR/src/assets/plugins"

# 5. Check if folders already exist
if [ -d "$APP_PLUGINS_DIR/$PLUGIN_NAME" ]; then
    echo "[ERROR] Plugin folder '$PLUGIN_NAME' already exists in $APP_PLUGINS_DIR. Aborting."
    exit 1
fi

if [ -d "$ASSETS_PLUGINS_DIR/$PLUGIN_NAME" ]; then
    echo "[ERROR] Plugin folder '$PLUGIN_NAME' already exists in $ASSETS_PLUGINS_DIR. Aborting."
    exit 1
fi

# 6. Create directories and copy contents
echo "Copying source files..."
mkdir -p "$APP_PLUGINS_DIR/$PLUGIN_NAME"
cp -r "$PLUGIN_PATH/src/." "$APP_PLUGINS_DIR/$PLUGIN_NAME/"

echo "Copying assets..."
mkdir -p "$ASSETS_PLUGINS_DIR/$PLUGIN_NAME"
cp -r "$PLUGIN_PATH/assets/." "$ASSETS_PLUGINS_DIR/$PLUGIN_NAME/"

echo "------------------------------------------"
echo "[SUCCESS] Plugin '$PLUGIN_NAME' loaded successfully."