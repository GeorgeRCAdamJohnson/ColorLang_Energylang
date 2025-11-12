"""
Simple test to verify HTML file serving
"""
import os
from http.server import HTTPServer, BaseHTTPRequestHandler

class TestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        print(f"[TEST] Request path: {self.path}")
        
        if self.path == '/' or self.path == '/index.html':
            # Serve HTML content
            script_dir = os.path.dirname(os.path.abspath(__file__))
            html_path = os.path.join(script_dir, 'web_advanced_platform.html')
            
            print(f"[TEST] Looking for HTML at: {html_path}")
            print(f"[TEST] File exists: {os.path.exists(html_path)}")
            
            if os.path.exists(html_path):
                try:
                    with open(html_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    self.send_response(200)
                    self.send_header('Content-Type', 'text/html; charset=utf-8')
                    self.send_header('Content-Length', str(len(content.encode('utf-8'))))
                    self.end_headers()
                    self.wfile.write(content.encode('utf-8'))
                    print(f"[TEST] Successfully served HTML file ({len(content)} chars)")
                except Exception as e:
                    print(f"[TEST] Error reading HTML: {e}")
                    self.send_error(500, f"Error reading HTML: {e}")
            else:
                # Send simple HTML response
                content = """
<!DOCTYPE html>
<html>
<head><title>Test Server</title></head>
<body>
    <h1>Test Server Working!</h1>
    <p>HTML file not found, but server is responding correctly.</p>
</body>
</html>"""
                self.send_response(200)
                self.send_header('Content-Type', 'text/html; charset=utf-8')
                self.send_header('Content-Length', str(len(content.encode('utf-8'))))
                self.end_headers()
                self.wfile.write(content.encode('utf-8'))
                print("[TEST] Served test HTML content")
        else:
            self.send_error(404, "Not found")

if __name__ == '__main__':
    print("Starting test server on port 8080...")
    server = HTTPServer(('', 8080), TestHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nTest server stopped.")