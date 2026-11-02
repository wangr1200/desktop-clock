const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } = require('electron');
const path = require('path');

let win = null;
let tray = null;

function createWindow() {
  win = new BrowserWindow({
    width: 380,
    height: 340,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true, // 隐藏下方任务栏图标
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile('index.html');

  // 点击关闭按钮时隐藏窗口
  win.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      win.hide();
    }
  });

  // 监听来自前端的设置指令
  ipcMain.on('update-settings', (event, settings) => {
    if (settings.mouseThrough) {
      win.setIgnoreMouseEvents(true, { forward: true });
    } else {
      win.setIgnoreMouseEvents(false);
    }

    app.setLoginItemSettings({
      openAtLogin: settings.autoStart,
      path: process.execPath
    });
  });
}

app.whenReady().then(() => {
  createWindow();

  // 创建右下角系统托盘：使用绝对可靠的本地图片或者创建一个带颜色的占位图标
  try {
    const iconPath = path.join(__dirname, 'icon.png');
    // 如果你在目录放了 icon.png 就用它，没放的话用内置方法生成一个可见图标
    tray = new Tray(iconPath);
  } catch (e) {
    // 兜底方案：动态创建一个 16x16 像素的带颜色图标，确保能看见
    const size = 16;
    const canvas = nativeImage.createFromBuffer(Buffer.alloc(size * size * 4, 255), { width: size, height: size });
    tray = new Tray(canvas);
  }
  
  if (tray) {
    const contextMenu = Menu.buildFromTemplate([
      { 
        label: '显示/隐藏时钟', 
        click: () => {
          if (win && !win.isDestroyed()) {
            if (win.isVisible()) {
              win.hide();
            } else {
              win.show();
            }
          }
        } 
      },
      { type: 'separator' },
      { 
        label: '退出软件', 
        click: () => {
          app.isQuiting = true;
          app.quit();
        } 
      }
    ]);

    tray.setToolTip('Desktop Clock 桌面时钟');
    tray.setContextMenu(contextMenu);

    tray.on('double-click', () => {
      if (win && !win.isDestroyed()) {
        if (win.isVisible()) {
          win.hide();
        } else {
          win.show();
        }
      }
    });
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});