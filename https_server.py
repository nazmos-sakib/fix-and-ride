#!/usr/bin/env python3
import http.server
import ssl

PORT = 5500
DIRECTORY = "./"

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    # Inject security headers here
    def end_headers(self):
        self.send_header(
            "Content-Security-Policy",
            "frame-ancestors 'self' https://efty.example.com"
        )
        self.send_header(
            "X-Frame-Options",
            "SAMEORIGIN"
        )
        super().end_headers()

httpd = http.server.HTTPServer(('0.0.0.0', PORT), Handler)

# --- Modern SSL setup ---
context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
context.load_cert_chain(
    certfile="localhost+2.pem",
    keyfile="localhost+2-key.pem"
)

httpd.socket = context.wrap_socket(httpd.socket, server_side=True)

print(f"HTTPS server running at https://localhost:{PORT}")
httpd.serve_forever()
