# Manual Installation Guide

The automatic scripts are failing on your machine. You must run these commands manually in your VS Code terminal to fix the errors.

1.  **Open Terminal** in VS Code (Ctrl + `).
2.  **Navigate** to the web folder:
    ```bash
    cd apps/web
    ```
3.  **Clean** your environment (Copy and Paste this):
    ```bash
    rmdir /s /q node_modules
    del package-lock.json
    npm cache clean --force
    ```
4.  **Install** dependencies (Copy and Paste this):
    ```bash
    npm install --legacy-peer-deps --no-audit
    ```
    *Wait for this to finish. If it turns red, take a screenshot.*

5.  **Run** the app:
    ```bash
    npm run dev
    ```
