const { Client } = require('ssh2');
const net = require('net');
const dotenv = require('dotenv');

dotenv.config();

const sshConfig = {
    host: process.env.SSH_HOST,
    port: process.env.SSH_PORT || 22,
    username: process.env.SSH_USERNAME,
    password: process.env.SSH_PASSWORD,
<<<<<<< HEAD
    // privateKey: process.env.SSH_PRIVATE_KEY_PATH ? require('fs').readFileSync(process.env.SSH_PRIVATE_KEY_PATH) : undefined,
};

// Remote database location (relative to the SSH server)
const dbConfig = {
    host: '127.0.0.1', // localhost on the VPS
    port: 3306,        // MySQL default port
};

// Local port to forward from
const localPort = process.env.DB_PORT || 3307;

const createTunnel = () => {
    return new Promise((resolve, reject) => {
        // If no SSH host is defined, skip tunneling (development without SSH or production local)
=======
};

const dbConfig = {
    host: '127.0.0.1',
    port: 3306,
};

// Use a dedicated, non-conflicting port for the local end of the tunnel.
const localPort = 3306;

const createTunnel = () => {
    return new Promise((resolve, reject) => {
>>>>>>> 7811efb (new todo)
        if (!process.env.SSH_HOST) {
            console.log('ℹ️  No SSH_HOST defined, skipping SSH tunnel.');
            return resolve(null);
        }

        const conn = new Client();

        conn.on('ready', () => {
            console.log('🔐 SSH Connection :: ready');

<<<<<<< HEAD
            // Start a local server to forward traffic
=======
>>>>>>> 7811efb (new todo)
            const server = net.createServer((socket) => {
                conn.forwardOut(
                    '127.0.0.1',
                    socket.remotePort,
                    dbConfig.host,
                    dbConfig.port,
                    (err, stream) => {
                        if (err) {
                            console.error('❌ SSH Forwarding Error:', err);
                            socket.end();
                            return;
                        }
                        socket.pipe(stream);
                        stream.pipe(socket);
                    }
                );
            });

            server.listen(localPort, '127.0.0.1', () => {
                console.log(`✅ SSH Tunnel established: 127.0.0.1:${localPort} -> ${dbConfig.host}:${dbConfig.port}`);
                resolve(server);
            });

            server.on('error', (err) => {
                console.error('❌ Local SSH Tunnel Server Error:', err);
                reject(err);
            });
        });

        conn.on('error', (err) => {
            console.error('❌ SSH Connection Error:', err);
            reject(err);
        });
<<<<<<< HEAD
=======

>>>>>>> 7811efb (new todo)
        conn.connect(sshConfig);
    });
};

module.exports = createTunnel;
