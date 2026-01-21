# Deployment Instructions: Connecting Render to your VPS Database

Since your database is hosted on a VPS (Virtual Private Server) at `145.223.18.227`, you must perform a few manual steps on that server to allow Render to connect to it.

## 1. SSH into your VPS
Open a terminal on your local machine and connect to your VPS:
```bash
ssh root@145.223.18.227
```

## 2. Allow Remote Connections (Firewall)
You need to open port `3306` (MySQL) to the internet.

If you are using **UFW** (common on Ubuntu):
```bash
ufw allow 3306/tcp
ufw reload
```
*Note: If you are using a cloud provider firewall (like AWS Security Groups or DigitalOcean Firewalls), you must also add an Inbound Rule for TCP port 3306 there.*

## 3. Create a Remote MySQL User
For security, it is best to create a dedicated user for remote access instead of using `root`.

1. Log in to MySQL:
   ```bash
   mysql -u root -p
   ```
   (Enter your MySQL root password when prompted)

2. Run the following SQL commands (replace `your_secure_password` with a strong password):

   ```sql
   -- Create a new user that can connect from any IP (%)
   CREATE USER 'render_app'@'%' IDENTIFIED BY 'your_secure_password';

   -- Grant permission to your specific database (replace 'cms_db' with your actual DB name)
   GRANT ALL PRIVILEGES ON cms_db.* TO 'render_app'@'%';

   -- Apply changes
   FLUSH PRIVILEGES;

   -- Exit MySQL
   EXIT;
   ```

## 4. Configure MySQL Config (If needed)
Sometimes MySQL is configured to only listen on `127.0.0.1`. You need it to listen on `0.0.0.0`.

1. Check the config file (usually `/etc/mysql/mysql.conf.d/mysqld.cnf` or `/etc/my.cnf`):
   ```bash
   nano /etc/mysql/mysql.conf.d/mysqld.cnf
   ```
2. Find the line:
   ```ini
   bind-address = 127.0.0.1
   ```
3. Change it to:
   ```ini
   bind-address = 0.0.0.0
   ```
4. Save (Ctrl+O, Enter) and Exit (Ctrl+X).
5. Restart MySQL:
   ```bash
   systemctl restart mysql
   ```

## 5. Configure Render Environment Variables
When creating your service on Render, add these Environment Variables:

| Key | Value |
|-----|-------|
| `DB_HOST` | `145.223.18.227` |
| `DB_PORT` | `3306` |
| `DB_USERNAME` | `render_app` (or the user you created) |
| `DB_PASSWORD` | `your_secure_password` |

## 6. Option: Use DATABASE_URL
Instead of individual variables, you can use a single Connection String if you prefer.
Your code (`app/config/index.js`) supports this!

**Key**: `DATABASE_URL`
**Value**: `mysql://render_app:your_secure_password@145.223.18.227:3306/cms_db`

*Format: `mysql://USER:PASSWORD@HOST:PORT/DB_NAME`*

