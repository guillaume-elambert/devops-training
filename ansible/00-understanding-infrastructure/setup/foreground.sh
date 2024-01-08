# If $TOOLS_PATH is not set, set it to /root/tools
if [ -z "$TOOLS_PATH" ]; then
    export TOOLS_PATH=/root/tools
fi

# Make /root/tools/foreground.sh executable
# Force new terminal to run /root/tools/foreground.sh
# Run /root/tools/foreground.sh
clear && \
chmod +x $TOOLS_PATH/foreground.sh && \
echo $TOOLS_PATH/foreground.sh >> ~/.bashrc && \
$TOOLS_PATH/foreground.sh