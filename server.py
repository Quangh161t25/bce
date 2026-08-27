import http.server
import socketserver
import urllib.parse
import urllib.request
import re
import json

PORT = 8000

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith('/api/bing-images'):
            parsed = urllib.parse.urlparse(self.path)
            params = urllib.parse.parse_qs(parsed.query)
            q = params.get('q', [''])[0]
            
            if not q:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(b'{"items":[]}')
                return
            
            bing_url = 'https://www.bing.com/images/search?q=' + urllib.parse.quote(q)
            req = urllib.request.Request(bing_url, headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7'
            })
            
            items = []
            try:
                with urllib.request.urlopen(req, timeout=10) as resp:
                    html = resp.read().decode('utf-8', errors='ignore')
                    murls = re.findall(r'murl&quot;:&quot;(https?:[^&]+)&quot;', html)
                    titles = re.findall(r't1&quot;:&quot;([^&]+)&quot;', html)
                    
                    for i, u in enumerate(murls):
                        clean_u = u.replace('\\', '')
                        t = titles[i] if i < len(titles) else q
                        items.append({'link': clean_u, 'title': t})
            except Exception as e:
                print('Bing Scrape Error:', e)
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'items': items}).encode('utf-8'))
            return
        else:
            if self.path == '/' or self.path == '':
                self.path = '/index.html'
            super().do_GET()

if __name__ == '__main__':
    print(f"Starting BCE Local Dev Server with Bing Proxy on port {PORT}...")
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
        httpd.serve_forever()
