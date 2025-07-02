const { app, BrowserWindow } = require("electron");
const path = require("path");

let mainWindow = null;

createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: "OpenTimeTracker",
    resizable: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      setAppDetails: {
        appId: "com.OpenTimeTracker.altaskur",
      },
    },
  });

  mainWindow.loadURL(
    `file://${__dirname}/dist/OpenTimeTracker/browser/index.html`
  );

  //mainWindow.setMenu(null);

  mainWindow.webContents.openDevTools();

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
};

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
