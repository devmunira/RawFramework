const net = require("net");

class SimpleEmailService {
  constructor() {
    this.smtpConfig = {
      host: "smtp.gmail.com",
      port: 587,
      user: "muniraa.nz@gmail.com",
      pass: process.env.EMAIL_PASSWORD || "your-app-password",
    };
  }

  async sendEmail(to, subject, message, fromName = "Contact Form") {
    return new Promise((resolve, reject) => {
      const client = new net.Socket();
      let responseData = "";

      client.connect(this.smtpConfig.port, this.smtpConfig.host, () => {
        console.log("Connected to SMTP server");
      });

      client.on("data", (data) => {
        responseData += data.toString();
        const lines = responseData.split("\r\n");

        // Process each complete response
        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i];
          if (line) {
            console.log("SMTP Response:", line);

            // Handle different SMTP responses
            if (line.startsWith("220")) {
              // Server ready, send EHLO
              client.write("EHLO localhost\r\n");
            } else if (line.startsWith("250") && line.includes("EHLO")) {
              // EHLO successful, start TLS
              client.write("STARTTLS\r\n");
            } else if (line.startsWith("220") && line.includes("TLS")) {
              // TLS ready, upgrade connection
              this.upgradeToTLS(
                client,
                to,
                subject,
                message,
                fromName,
                resolve,
                reject
              );
              return;
            }
          }
        }

        responseData = lines[lines.length - 1];
      });

      client.on("error", (error) => {
        console.error("SMTP Error:", error);
        reject(error);
      });

      client.on("close", () => {
        console.log("SMTP connection closed");
      });
    });
  }

  upgradeToTLS(client, to, subject, message, fromName, resolve, reject) {
    const tls = require("tls");

    const tlsSocket = tls.connect(
      {
        socket: client,
        host: this.smtpConfig.host,
        port: this.smtpConfig.port,
        rejectUnauthorized: false,
      },
      () => {
        console.log("TLS connection established");
        this.sendEmailOverTLS(
          tlsSocket,
          to,
          subject,
          message,
          fromName,
          resolve,
          reject
        );
      }
    );

    tlsSocket.on("error", (error) => {
      console.error("TLS Error:", error);
      reject(error);
    });
  }

  sendEmailOverTLS(tlsSocket, to, subject, message, fromName, resolve, reject) {
    let step = 0;
    let responseData = "";

    const steps = [
      () => tlsSocket.write("EHLO localhost\r\n"),
      () => tlsSocket.write("AUTH LOGIN\r\n"),
      () =>
        tlsSocket.write(
          Buffer.from(this.smtpConfig.user).toString("base64") + "\r\n"
        ),
      () =>
        tlsSocket.write(
          Buffer.from(this.smtpConfig.pass).toString("base64") + "\r\n"
        ),
      () => tlsSocket.write(`MAIL FROM:<${this.smtpConfig.user}>\r\n`),
      () => tlsSocket.write(`RCPT TO:<${to}>\r\n`),
      () => tlsSocket.write("DATA\r\n"),
      () => {
        const emailContent = this.buildEmailContent(
          to,
          subject,
          message,
          fromName
        );
        tlsSocket.write(emailContent);
      },
      () => tlsSocket.write("QUIT\r\n"),
    ];

    tlsSocket.on("data", (data) => {
      responseData += data.toString();
      const lines = responseData.split("\r\n");

      for (let i = 0; i < lines.length - 1; i++) {
        const line = lines[i];
        if (line) {
          console.log(`Step ${step}:`, line);

          if (
            line.startsWith("250") ||
            line.startsWith("334") ||
            line.startsWith("235") ||
            line.startsWith("354")
          ) {
            step++;
            if (step < steps.length) {
              steps[step]();
            } else {
              tlsSocket.end();
              resolve({ success: true, message: "Email sent successfully" });
              return;
            }
          } else if (
            line.startsWith("535") ||
            line.startsWith("550") ||
            line.startsWith("553")
          ) {
            tlsSocket.end();
            reject(new Error(`SMTP Error: ${line}`));
            return;
          }
        }
      }

      responseData = lines[lines.length - 1];
    });
  }

  buildEmailContent(to, subject, message, fromName) {
    const emailContent = [
      `From: ${fromName} <${this.smtpConfig.user}>`,
      `To: ${to}`,
      `Subject: ${subject}`,
      `Date: ${new Date().toUTCString()}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/plain; charset=UTF-8`,
      `Content-Transfer-Encoding: 7bit`,
      ``,
      message,
      `.`,
      ``,
    ].join("\r\n");

    return emailContent;
  }
}

module.exports = SimpleEmailService;
