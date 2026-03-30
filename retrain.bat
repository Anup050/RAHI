@echo off
cd ai-engine
echo Retraining model...
python train_real.py
if %errorlevel% neq 0 (
    echo Train failed, trying train.py
    python train.py
)
