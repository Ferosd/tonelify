@echo off
echo Initializing Git repository...
git init

echo Adding files...
git add .

echo Committing files...
git commit -m "Initial commit: ToneAdapt Clone Project"

echo Renaming branch to main...
git branch -M main

echo Adding remote origin (https://github.com/Ferosd/Guitartone.git)...
git remote remove origin 2>nul
git remote add origin https://github.com/Ferosd/Guitartone.git

echo Pushing to GitHub...
git push -u origin main

echo Done!
pause
