@echo off
echo Finding python... > python_diagnostics.txt
where python >> python_diagnostics.txt 2>&1
echo Checking python version... >> python_diagnostics.txt
python --version >> python_diagnostics.txt 2>&1
echo Checking py version... >> python_diagnostics.txt
py --version >> python_diagnostics.txt 2>&1
echo Done >> python_diagnostics.txt
