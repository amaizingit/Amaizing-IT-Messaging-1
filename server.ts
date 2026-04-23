import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import makeWASocket, { DisconnectReason, useMultiFileAuthState, delay, fetchLatestBaileysVersion, Browsers } from "@whiskeysockets/baileys";
import QRCode from "qrcode";
import pino from "pino";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  // WhatsApp Logic
  let sock: any = null;
  let isConnecting = false;
  let reconnectTimer: NodeJS.Timeout | null = null;
  const sessionsPath = path.join(process.cwd(), "wa_sessions");
  
  if (!fs.existsSync(sessionsPath)) {
    fs.mkdirSync(sessionsPath);
  }

  // Initialize auth state once outside to prevent file access conflicts
  const { state, saveCreds } = await useMultiFileAuthState(path.join(sessionsPath, "main_session"));

  const connectToWhatsApp = async () => {
    if (isConnecting) {
      console.log("Connect requested but already in progress...");
      return;
    }
    
    isConnecting = true;
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    // Comprehensive Cleanup of existing socket
    if (sock) {
      console.log("Cleaning up existing WhatsApp socket...");
      try {
        const oldSock = sock;
        sock = null;
        oldSock.ev.removeAllListeners("connection.update");
        oldSock.ev.removeAllListeners("creds.update");
        oldSock.ev.removeAllListeners("messages.upsert");
        oldSock.end(undefined);
        // Give it a tiny moment to actually close the TCP stream
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        console.error("Cleanup error:", e);
      }
    }

    console.log("Attempting a fresh WhatsApp connection...");
    
    try {
      const { version } = await fetchLatestBaileysVersion();

      const currentSock = makeWASocket({
        version,
        printQRInTerminal: true,
        auth: state,
        logger: pino({ level: "error" }),
        browser: ["OmniInbox", "Chrome", "1.1.0"],
        syncFullHistory: false,
        connectTimeoutMs: 60000,
        qrTimeout: 40000,
        // Added some more robust options
        retryRequestDelayMs: 5000,
        maxMsgRetryCount: 3
      });

      sock = currentSock;

      currentSock.ev.on("creds.update", async () => {
        await saveCreds();
      });

      currentSock.ev.on("connection.update", async (update: any) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
          try {
            const qrDataUrl = await QRCode.toDataURL(qr);
            io.emit("wa_qr", qrDataUrl);
          } catch (err) {
            console.error("Error generating QR", err);
          }
        }

        if (connection === "open") {
          console.log("SUCCESS: WhatsApp connection established.");
          isConnecting = false;
          io.emit("wa_status", "connected");
        }

        if (connection === "close") {
          isConnecting = false;
          const error = lastDisconnect?.error;
          const statusCode = (error as any)?.output?.statusCode;
          const message = (error as any)?.message || "Unknown close reason";
          
          console.log(`Connection closed (Status: ${statusCode}). Reason: ${message}`);
          io.emit("wa_status", "disconnected");

          if (sock === currentSock) {
            sock = null; 
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
              const isConflict = message.includes("conflict") || statusCode === 440 || statusCode === 409;
              const delayTime = isConflict ? 30000 : 5000; // Increased conflict delay to 30s
              
              if (isConflict) {
                console.warn("CRITICAL: Connection conflict. Throttling for 30s to allow session flush...");
              }
              
              reconnectTimer = setTimeout(connectToWhatsApp, delayTime);
            } else {
              console.log("Logged out confirmed. Purging session files...");
              try {
                fs.rmSync(path.join(sessionsPath, "main_session"), { recursive: true, force: true });
              } catch (e) {
                console.error("Purge error:", e);
              }
              reconnectTimer = setTimeout(connectToWhatsApp, 5000);
            }
          }
        }
      });

      currentSock.ev.on("messages.upsert", async (m: any) => {
        io.emit("wa_message", m);
      });

    } catch (err) {
      console.error("Socket initialization failed:", err);
      isConnecting = false;
      reconnectTimer = setTimeout(connectToWhatsApp, 10000);
    }
  };

  // Start WhatsApp connection on server start
  connectToWhatsApp();

  io.on("connection", (socket) => {
    console.log("Client connected to socket:", socket.id);
    
    // Send current status
    if (sock && sock.user) {
      socket.emit("wa_status", "connected");
    } else {
      socket.emit("wa_status", isConnecting ? "connecting" : "disconnected");
    }

    socket.on("fb_send_message", async (data: { recipientId: string, text: string, accessToken: string }) => {
      console.log("Request to send FB message:", data.recipientId);
      if (!data.accessToken) {
        console.warn("Cannot send FB message: Missing access token");
        return;
      }

      try {
        const response = await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${data.accessToken}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipient: { id: data.recipientId },
            message: { text: data.text }
          })
        });

        const result = await response.json();
        if (result.error) {
          console.error("Facebook API error:", result.error);
        } else {
          console.log("Facebook message sent successfully:", result);
        }
      } catch (error) {
        console.error("Error sending Facebook message:", error);
      }
    });

    socket.on("wa_logout", async () => {
      console.log("Manual logout/reset requested by client.");
      if (sock) {
        try {
          sock.end(undefined);
          sock = null;
        } catch (e) {}
      }
      try {
        fs.rmSync(path.join(sessionsPath, "main_session"), { recursive: true, force: true });
        console.log("Session purged successfully.");
        io.emit("wa_status", "disconnected");
        // Start a fresh connection after purge
        setTimeout(connectToWhatsApp, 2000);
      } catch (e) {
        console.error("Manual purge error:", e);
      }
    });

    socket.on("wa_send_message", async (data: { jid: string, text: string }) => {
      console.log("Request to send WA message:", data);
      if (sock && sock.user) {
        try {
          await sock.sendMessage(data.jid, { text: data.text });
          console.log("Message sent successfully to:", data.jid);
        } catch (error) {
          console.error("Error sending WhatsApp message:", error);
        }
      } else {
        console.warn("Cannot send message: WhatsApp not connected");
      }
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
