@echo off
cd apps\web
echo Installing Scoped Packages...
call npm install @radix-ui/react-dialog @radix-ui/react-slot @radix-ui/react-avatar @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-tabs @radix-ui/react-alert-dialog @radix-ui/react-select @radix-ui/react-separator @hookform/resolvers @tanstack/react-query
echo Done.
