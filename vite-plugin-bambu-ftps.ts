import type { Plugin } from 'vite';
import * as ftp from 'basic-ftp';
import formidable from 'formidable';
import fs from 'fs';

export function bambuFtpsPlugin(): Plugin {
  return {
    name: 'vite-plugin-bambu-ftps',
    configureServer(server) {
      server.middlewares.use('/api/ftp/upload', async (req, res, next) => {
        if (req.method !== 'POST') {
          return next();
        }

        const form = formidable({ multiples: false });
        form.parse(req, async (err, fields, files) => {
          if (err) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: err.message }));
            return;
          }

          try {
            const ip = Array.isArray(fields.ip) ? fields.ip[0] : fields.ip;
            const accessCode = Array.isArray(fields.accessCode) ? fields.accessCode[0] : fields.accessCode;
            const file = Array.isArray(files.file) ? files.file[0] : files.file;

            if (!ip || !accessCode || !file) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Missing ip, accessCode, or file' }));
              return;
            }

            const client = new ftp.Client();
            // Bambu Lab printers use explicit FTPS on port 990
            client.ftp.verbose = true;

            await client.access({
              host: ip,
              port: 990,
              user: 'bblp',
              password: accessCode,
              secure: 'implicit',
              secureOptions: { rejectUnauthorized: false }
            });

            const remotePath = `/${file.originalFilename || 'upload.3mf'}`;
            await client.uploadFrom(file.filepath, remotePath);
            client.close();

            // Delete temporary file
            fs.unlinkSync(file.filepath);

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, path: remotePath }));
          } catch (ftpError: any) {
            console.error('FTPS Upload error:', ftpError);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: ftpError.message || 'FTPS Upload failed' }));
          }
        });
      });
    }
  };
}
