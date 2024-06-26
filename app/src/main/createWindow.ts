
import { BrowserWindow, BrowserWindowConstructorOptions, shell } from 'electron'
import { is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { join } from 'path'
import url from 'node:url'
export interface OptionsType extends Partial<BrowserWindowConstructorOptions>{
    openDevTools?: boolean,
    hash?: string
    initShow?: boolean
}
export function createWindow(options: OptionsType, router_url=""): BrowserWindow {  // Create the browser window.
    const win = new BrowserWindow(Object.assign({
        width: 500,
        height: 350,
        center: true,
        show: false,
        frame: false,
        transparent: true,
        // alwaysOnTop: true,
        autoHideMenuBar: true,
        ...(process.platform === 'linux' ? { icon } : {}),
        webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            sandbox: false,
            webSecurity: false // 禁用web安全性
        }
    }, options))
    // 如果是在开发环境下并且选项是打开开发者工具
    if (is.dev && options.openDevTools) win.webContents.openDevTools()
    win.on('ready-to-show', () => {
        options.initShow && win.show()
    })

    win.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url)
        return { action: 'deny' }
    })


    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        win.loadURL(process.env['ELECTRON_RENDERER_URL'] + options.hash + router_url)
      } else {
        win.loadURL(
          url.format({
            pathname: join(__dirname, '../renderer/index.html'),
            protocol: 'file',
            slashes: true,
            hash: options.hash?.substring(1) + router_url
          })
        )
      }
  

    return win
}
