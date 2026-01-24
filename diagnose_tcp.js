const { Client } = require('ssh2');
const dotenv = require('dotenv');

dotenv.config();

const conn = new Client();

const sshConfig = {
    host: process.env.SSH_HOST,
    port: process.env.SSH_PORT || 22,
    username: process.env.SSH_USERNAME,
    password: process.env.SSH_PASSWORD,
};

console.log("Connecting to SSH...");

conn.on('ready', () => {
    console.log('SSH Ready. Testing MySQL TCP connection on remote...');

    // Force TCP using -h 127.0.0.1
    const cmd = `mysql -h 127.0.0.1 -P 3306 -u ${process.env.DB_USERNAME} -p'${process.env.DB_PASSWORD}' -e "SELECT 'SUCCESS_TCP_CONNECT' as status;"`;

    console.log(`Running: mysql -h 127.0.0.1 ...`);

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            console.log('Remote command closed with code: ' + code);
            conn.end();
        }).on('data', (data) => {
            console.log('STDOUT: ' + data);
        }).stderr.on('data', (data) => {
            console.log('STDERR: ' + data);
        });
    });
}).connect(sshConfig);

conn.on('error', (err) => {
    console.error("SSH Connection Error:", err);
});
