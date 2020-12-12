"use strict";

import { app, protocol, BrowserWindow, ipcMain } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
import config from "../config"
import update from "./update"
import HttpClient from "./http"
const httpClient = new HttpClient();

const isDevelopment = process.env.NODE_ENV !== "production";

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
    { scheme: "app", privileges: { secure: true, standard: true } },
]);



async function createWindow() {
    // Create the browser window.
    let mainWindow = new BrowserWindow({
        title: config.renderConfig.layout.title,
        height: config.mainConfig.height,
        width: config.mainConfig.width,
        webPreferences: {
            nodeIntegration: true,
            nodeIntegrationInWorker: true,
            webviewTag: true
        },
    });
    if (process.env.WEBPACK_DEV_SERVER_URL) {
        // Load the url of the dev server if in development mode
        await mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
        if (!process.env.IS_TEST) mainWindow.webContents.openDevTools();
    } else {
        createProtocol("app");
        mainWindow.loadURL(config.mainConfig.onlineUrl).then().catch(err => {
            console.error(err)
            // mainWindow.loadURL("app://./index.html");
        });
    }
    mainWindow.on("closed", () => {
        mainWindow = null;
    });
    mainWindow.once("ready-to-show", () => {
        mainWindow.show();
        mainWindow.fullScreen();
        update();
    });
    //=====================================render进程事件====================================//
    ipcMain.on("vue-fresh-content", () => {
        mainWindow.webContents.reload()
    });
    ipcMain.on("vue-strong-fresh-content", () => {
        mainWindow.webContents.session.clearCache().then(() => {
            mainWindow.webContents.reload()
        });
    });
    ipcMain.on("vue-open-dev-tools", () => {
        mainWindow.webContents.openDevTools();
    });
    ipcMain.on("vue-send-request", (event, data) => {
        httpClient.request(data.url, {
            ...data
        }).then(res => {
            event.sender.send("http-response", res);
        }).catch(err => {
            event.sender.send("http-error", err);
        });
    });
}

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on("ready", async () => {
    if (isDevelopment && !process.env.IS_TEST) {
        try {
            await installExtension(VUEJS_DEVTOOLS);
        } catch (e) {
            console.error("Vue Devtools failed to install:", e.toString());
        }
    }
    createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
    if (process.platform === "win32") {
        process.on("message", (data) => {
            if (data === "graceful-exit") {
                app.quit();
            }
        });
    } else {
        process.on("SIGTERM", () => {
            app.quit();
        });
    }
}
