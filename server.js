// SACPF online relay + web server.
// Serves the game page (index.html) and passes messages between the two players of a game.
// It keeps NO game data: the host's browser runs the game, this just forwards messages.
const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 3000;
const PAGE = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8')
  .replace('<head>', '<head><script>window.SACPF_NET=true</script>');

const server = http.createServer((req, res) => {
  const url = (req.url || '/').split('?')[0];
  if (url === '/healthz') { res.writeHead(200, { 'Content-Type': 'text/plain' }); res.end('ok'); return; }
  if (url === '/' || url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
    res.end(PAGE); return;
  }
  res.writeHead(404, { 'Content-Type': 'text/plain' }); res.end('Not found');
});

const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 8 * 1024 * 1024 });
const rooms = new Map();            // code -> { host, guest, last }
const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const okCode = c => typeof c === 'string' && /^[A-Z2-9]{5}$/.test(c);
const newCode = () => { for (;;) { let c = ''; for (let i = 0; i < 5; i++) c += ALPHA[Math.floor(Math.random() * ALPHA.length)]; if (!rooms.has(c)) return c; } };
const send = (ws, o) => { try { if (ws && ws.readyState === 1) ws.send(JSON.stringify(o)); } catch (e) {} };
const alive = ws => ws && ws.readyState === 1;

wss.on('connection', ws => {
  ws.isAlive = true; ws.room = null; ws.role = null;
  ws.on('pong', () => { ws.isAlive = true; });
  ws.on('message', (data, isBinary) => {
    if (isBinary) return;
    const txt = data.toString();
    if (!ws.room) {                                   // first message: host or join
      let m; try { m = JSON.parse(txt); } catch (e) { return; }
      if (m.t === 'host') {
        let code = okCode(m.code) ? m.code : newCode();
        let r = rooms.get(code);
        if (r && alive(r.host) && r.host !== ws) { send(ws, { t: 'err', m: 'That game code is already being hosted.', fatal: true }); ws.close(); return; }
        if (!r) { r = { host: null, guest: null, last: Date.now() }; rooms.set(code, r); }
        r.host = ws; ws.room = code; ws.role = 'host'; r.last = Date.now();
        send(ws, { t: 'hosted', code, guest: alive(r.guest) });
        if (alive(r.guest)) send(r.guest, { t: 'peer', s: 'joined' });
      } else if (m.t === 'join') {
        const code = String(m.code || '').toUpperCase().trim();
        const r = okCode(code) ? rooms.get(code) : null;
        if (!r) { send(ws, { t: 'err', m: 'No game found with that code. Check the code, and make sure the host has opened their game.', code: 'nogame' }); ws.close(); return; }
        if (alive(r.guest) && r.guest !== ws) { try { r.guest.room = null; r.guest.close(); } catch (e) {} }
        r.guest = ws; ws.room = code; ws.role = 'guest'; r.last = Date.now();
        send(ws, { t: 'joined', code, host: alive(r.host) });
        if (alive(r.host)) send(r.host, { t: 'peer', s: 'joined' });
      }
      return;
    }
    const r = rooms.get(ws.room); if (!r) return;
    r.last = Date.now();
    const other = ws.role === 'host' ? r.guest : r.host;
    if (alive(other)) { try { other.send(txt); } catch (e) {} }
  });
  ws.on('close', () => {
    const r = ws.room && rooms.get(ws.room); if (!r) return;
    if (ws.role === 'host' && r.host === ws) { r.host = null; send(r.guest, { t: 'peer', s: 'left' }); }
    if (ws.role === 'guest' && r.guest === ws) { r.guest = null; send(r.host, { t: 'peer', s: 'left' }); }
    r.last = Date.now();
  });
  ws.on('error', () => {});
});

// keep connections healthy; drop dead ones
setInterval(() => {
  wss.clients.forEach(ws => { if (!ws.isAlive) { ws.terminate(); return; } ws.isAlive = false; try { ws.ping(); } catch (e) {} });
  const now = Date.now();
  for (const [c, r] of rooms) if (!alive(r.host) && !alive(r.guest) && now - r.last > 30 * 60 * 1000) rooms.delete(c);
}, 25000);

server.listen(PORT, () => console.log('SACPF online listening on ' + PORT));
