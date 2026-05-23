import fs from 'fs';
import path from 'path';

// 获取当前脚本所在目录
const getDirname = () => {
    const url = new URL(import.meta.url);
    let dirname = path.dirname(url.pathname);
    
    // 处理 Windows 路径
    if (process.platform === 'win32') {
        // 移除前导斜杠
        if (dirname.startsWith('/')) {
            dirname = dirname.slice(1);
        }
        // 转换为 Windows 路径分隔符
        dirname = dirname.replace(/\//g, '\\');
    }
    
    return dirname;
};

const CURRENT_DIR = getDirname();
const BIJI_DIR = path.join(CURRENT_DIR, 'biji');
const OUTPUT_FILE = path.join(CURRENT_DIR, 'file-list.json');

function scanDirectory(directory, parentPath = '') {
    const items = [];
    
    try {
        const entries = fs.readdirSync(directory, { withFileTypes: true });
        
        // 排序：文件夹在前，文件在后，按名称排序
        entries.sort((a, b) => {
            const aIsDir = a.isDirectory();
            const bIsDir = b.isDirectory();
            
            if (aIsDir && !bIsDir) return -1;
            if (!aIsDir && bIsDir) return 1;
            
            return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
        });
        
        for (const entry of entries) {
            if (entry.name.startsWith('.')) {
                continue;
            }
            
            const relativePath = parentPath ? `${parentPath}/${entry.name}` : entry.name;
            const fullPath = path.join(directory, entry.name);
            
            if (entry.isDirectory()) {
                const children = scanDirectory(fullPath, relativePath);
                if (children.length > 0) {
                    items.push({
                        'name': entry.name,
                        'path': relativePath,
                        'isFolder': true,
                        'children': children
                    });
                }
            } else if (['.md', '.markdown'].includes(path.extname(entry.name).toLowerCase())) {
                const stat = fs.statSync(fullPath);
                items.push({
                    'name': entry.name,
                    'path': relativePath,
                    'isFolder': false,
                    'size': stat.size,
                    'updatedAt': stat.mtime.getTime()
                });
            }
        }
    } catch (err) {
        console.error(`Error scanning directory: ${err.message}`);
    }
    
    return items;
}

export function main() {
    console.log(`Scanning directory: ${BIJI_DIR}`);
    
    if (!fs.existsSync(BIJI_DIR)) {
        console.log(`❌ Directory not found: ${BIJI_DIR}`);
        console.log(`   Please create the 'biji' folder and add your markdown files`);
        return;
    }
    
    const tree = scanDirectory(BIJI_DIR);
    
    const output = {
        'version': '1.0',
        'timestamp': Date.now(),
        'tree': tree
    };
    
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8');
    
    console.log(`✅ File list generated: ${OUTPUT_FILE}`);
    console.log(`📁 Found ${tree.length} top-level items`);
    
    const fileCount = tree.filter(item => !item.isFolder).length;
    const folderCount = tree.filter(item => item.isFolder).length;
    console.log(`   📄 ${fileCount} files, 📁 ${folderCount} folders`);
}

// 直接运行时执行
if (process.argv[1] && process.argv[1].endsWith('scan-files.js')) {
    main();
}
