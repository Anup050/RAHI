@echo off
cd apps\web
echo Installing missing packages...
call npm install framer-motion class-variance-authority @radix-ui/react-slot @radix-ui/react-label @radix-ui/react-select @radix-ui/react-dropdown-menu @radix-ui/react-avatar @radix-ui/react-dialog @radix-ui/react-separator @radix-ui/react-tabs react-hook-form zod @hookform/resolvers
echo Done.
pause
