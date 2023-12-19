# Make /root/tools/foreground.sh executable
# Force new terminal to run /root/tools/foreground.sh
# Run /root/tools/foreground.sh
clear && \
chmod +x /root/tools/foreground.sh && \
echo /root/tools/foreground.sh >> ~/.bashrc && \
/root/tools/foreground.sh