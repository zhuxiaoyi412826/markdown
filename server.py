#!/usr/bin/env python3
"""
简单的 Markdown 笔记服务器
支持静态文件服务和动态列出 biji 文件夹中的文件
"""

import os
import json
from http.server import HTTPServer, SimpleHTTPRequestHandler

PORT = 5000
BIJI_DIR = 'biji'


class MarkdownHandler(SimpleHTTPRequestHandler):
    """自定义请求处理器"""
    
    def end_headers(self):
        # 添加 CORS 头部，允许跨域访问
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()
    
    def do_GET(self):
        # 处理 API 请求
        if self.path == '/api/biji-files':
            self.handle_biji_files()
        else:
            # 处理普通静态文件请求
            super().do_GET()
    
    def handle_biji_files(self):
        """返回 biji 文件夹中的 MD 文件列表"""
        try:
            files = []
            if os.path.exists(BIJI_DIR) and os.path.isdir(BIJI_DIR):
                for filename in os.listdir(BIJI_DIR):
                    if filename.lower().endswith('.md'):
                        files.append(filename)
            
            # 按文件名排序
            files.sort()
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            
            response = {
                'success': True,
                'files': files
            }
            self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'success': False, 'error': str(e)}).encode('utf-8'))


def main():
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, MarkdownHandler)
    
    print(f"========================================")
    print(f"  Markdown 笔记服务器已启动")
    print(f"  服务器地址: http://localhost:{PORT}")
    print(f"  API 地址: http://localhost:{PORT}/api/biji-files")
    print(f"  按 Ctrl+C 停止服务器")
    print(f"========================================")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n服务器已停止")
        httpd.shutdown()


if __name__ == '__main__':
    main()
