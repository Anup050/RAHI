@echo off
python test_diagnostics.py
if exist direct_output.txt (
    type direct_output.txt
) else (
    echo "direct_output.txt not found"
)
