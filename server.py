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
            # 处理 biji 文件夹中的文件请求
            if '/biji/' in self.path:
                # 解码 URL 编码的字符
                import urllib.parse
                decoded_path = urllib.parse.unquote(self.path)
                
                # 确保路径以 /biji/ 开头
                if not decoded_path.startswith('/biji/'):
                    decoded_path = '/' + decoded_path
                
                # 提取 biji 文件夹后的相对路径（去掉 /biji/ 前缀）
                biji_relative = decoded_path[6:]  # 去掉 '/biji/'
                
                # 移除可能的尾部斜杠
                if biji_relative.endswith('/'):
                    biji_relative = biji_relative[:-1]
                
                # 将正斜杠转换为操作系统路径分隔符
                biji_path = biji_relative.replace('/', os.sep)
                
                # 构建完整的文件路径
                full_path = os.path.join(os.getcwd(), 'biji', biji_path)
                
                # 调试信息
                print(f"Request path: {self.path}")
                print(f"Decoded path: {decoded_path}")
                print(f"Biji relative: {biji_relative}")
                print(f"Full path: {full_path}")
                print(f"Is file: {os.path.isfile(full_path)}")
                
                # 检查是否为文件
                if os.path.isfile(full_path):
                    self.serve_file(full_path)
                    return
            
            # 回退到默认处理
            super().do_GET()
    
    def serve_file(self, file_path):
        """Serve a static file"""
        try:
            with open(file_path, 'rb') as f:
                content = f.read()
            
            self.send_response(200)
            if file_path.endswith('.md'):
                self.send_header('Content-Type', 'text/markdown; charset=utf-8')
            elif file_path.endswith('.html'):
                self.send_header('Content-Type', 'text/html; charset=utf-8')
            elif file_path.endswith('.css'):
                self.send_header('Content-Type', 'text/css; charset=utf-8')
            elif file_path.endswith('.js'):
                self.send_header('Content-Type', 'application/javascript; charset=utf-8')
            elif file_path.endswith('.svg'):
                self.send_header('Content-Type', 'image/svg+xml; charset=utf-8')
            else:
                self.send_header('Content-Type', 'application/octet-stream')
            self.send_header('Content-Length', len(content))
            self.end_headers()
            self.wfile.write(content)
        except Exception as e:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(f"File not found: {e}".encode('utf-8'))
    
    def handle_biji_files(self):
        """返回 biji 文件夹中的文件结构（支持树形结构）"""
        try:
            # 构建树形结构
            def build_tree(path):
                tree = []
                full_path = os.path.join(BIJI_DIR, path) if path else BIJI_DIR
                
                # 先获取文件夹，再获取文件
                dirs = []
                files = []
                
                for name in os.listdir(full_path):
                    item_path = os.path.join(full_path, name)
                    if os.path.isdir(item_path):
                        dirs.append(name)
                    elif name.lower().endswith('.md'):
                        files.append(name)
                
                # 排序：文件夹在前，文件在后
                dirs.sort()
                files.sort()
                
                # 添加文件夹（递归）
                for dir_name in dirs:
                    children = build_tree(os.path.join(path, dir_name) if path else dir_name)
                    # 使用正斜杠作为路径分隔符，确保 URL 兼容
                    path_str = os.path.join(path, dir_name) if path else dir_name
                    tree.append({
                        'type': 'folder',
                        'name': dir_name,
                        'path': path_str.replace('\\', '/'),
                        'children': children,
                        'hasChildren': len(children) > 0
                    })
                
                # 添加文件
                for file_name in files:
                    # 使用正斜杠作为路径分隔符，确保 URL 兼容
                    path_str = os.path.join(path, file_name) if path else file_name
                    tree.append({
                        'type': 'file',
                        'name': file_name,
                        'path': path_str.replace('\\', '/'),
                        'title': file_name.replace('.md', '')
                    })
                
                return tree
            
            tree = build_tree('')
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            
            response = {
                'success': True,
                'tree': tree
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
