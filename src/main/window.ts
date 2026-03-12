import { BrowserWindow, screen } from 'electron';
import path from 'path';

// 在 ES 模块中定义 __dirname
// 在生产环境中 __dirname 可能已经由构建工具处理
// 这是一个常见的兼容性模式
let __dirname: string;
try {
  const { fileURLToPath } = await import('url');
  const __filename = fileURLToPath(import.meta.url);
  __dirname = path.dirname(__filename);
} catch (e) {
  // 如果在 CommonJS 环境中，__dirname 已经存在
  // 这里做一个回退，虽然在这个项目中是 ESM
  // @ts-ignore
  __dirname = global.__dirname || '';
}

function createWindow(): BrowserWindow {
  // 获取屏幕尺寸
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  // 创建浏览器窗口
  const mainWindow = new BrowserWindow({
    width: Math.floor(width * 0.8),
    height: Math.floor(height * 0.8),
    backgroundColor: '#2d3748', // 设置背景色以避免白色闪烁
    show: false, // 初始隐藏，等待 ready-to-show
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false // 禁用沙箱以支持 Node.js 模块
    },
    title: 'Workclaw',
    icon: path.join(__dirname, '../../public/icon.png')
  });

  // 加载应用
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
  }

  // 优雅地显示窗口
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // 窗口关闭时的处理
  mainWindow.on('closed', () => {
    // 在Windows上，直接关闭窗口
  });

  return mainWindow;
}

export { createWindow };
