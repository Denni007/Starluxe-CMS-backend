# Fix for "Not a git repository" Error

The error `fatal: not a git repository` happens because the folder `/root/cms/Starluxe-CMS-backend` on your VPS is either:
1.  **Empty**, or
2.  **Not connected to git** (e.g., files were uploaded via FileZilla without `.git` hidden folder).

Since you prefer the standard `git pull` command in `main.yml`, you **must** manually set up the repository on the server **once**.

## 1. Login to VPS
Open your terminal and SSH in (or use the Console in your VPS provider):
```bash
ssh root@145.223.18.227
```

## 2. Run these commands EXACTLY
This will wipe the broken folder and re-download a fresh copy linked to GitHub.

```bash
# Go to the parent directory
cd /root/cms

# Remove the broken/empty folder
rm -rf Starluxe-CMS-backend

# Clone the repository freshly
git clone https://github.com/Denni007/Starluxe-CMS-backend.git

# Enter the new folder
cd Starluxe-CMS-backend

# Install dependencies manually once to verify
npm install

# Restart the app
pm2 restart cms-backend
```

## Why this fixes it
Your `main.yml` runs `git pull`.
-   `git pull` **only works** if the folder is already a git repo.
-   `git clone` **creates** the git repo.
-   By running `git clone` manually once, you fix the folder state. Future `main.yml` deployments (which use `git pull`) will work!
