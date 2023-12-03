const { exec } = require("child_process");
const path = require("path");

const { sendModuleBasedInGameCmdMessage } = require("./commons");

const ModuleName = "OBS";

// To work this requires the shortcut to have the --startstreaming arg set in Target
const obsShortcutPath = path.join(
  __dirname,
  "..",
  "/assets/obs_executable_shortcut.lnk"
);

const OBSExecutableName = "obs64.exe";

const OBSTrackedStatuses = {
  OFF: 0,
  LIVE: 1,
};

let obsStatus = OBSTrackedStatuses.OFF;

const sendInGameCmdMessage = (mod) => (msg) =>
  sendModuleBasedInGameCmdMessage(mod)(ModuleName)(msg);

const Messages = {
  OBSLaunchError: "Launch OBS error.",
  OBSLaunchSuccess: "Launch OBS success.",
  KillOBSError: "Kill OBS error.",
  KillOBSSuccess: "Kill OBS success.",
  OBSAlreadyKilled: "OBS was not running.",
  AvailableCommands: "Available commands: 'start', 'stop'.",
  OBSCurrentStatus: (status) =>
    `OBS is ${status ? "running." : "not running."}`,
};

const launchOBSOBS = (mod) => {
  exec(
    `start '${obsShortcutPath}'`,
    {
      cwd: process.env.HOMEPATH,
      shell: `powershell.exe`,
      windowsHide: true,
      windowsVerbatimArguments: true,
    },
    (error, stdout, stderr) => {
      if (error) {
        sendInGameCmdMessage(mod)(Messages.OBSLaunchError);
        mod.log(error);
        return;
      }
      obsStatus = OBSTrackedStatuses.LIVE;
      sendInGameCmdMessage(mod)(Messages.OBSLaunchSuccess);
    }
  );
};

const killOBS = (mod) => {
  exec("tasklist", (err, stdout, stderr) => {
    if (err) {
      sendInGameCmdMessage(mod)(Messages.KillOBSError);
      console.error(err);
      return;
    }

    let lines = stdout.split("\n");
    let appLine = lines.filter((line) => line.includes(OBSExecutableName));

    if (appLine.length > 0) {
      let pid = appLine[0].split(/\s+/)[1];
      process.kill(pid);
      obsStatus = OBSTrackedStatuses.OFF;
      sendInGameCmdMessage(mod)(Messages.KillOBSSuccess);
    } else {
      obsStatus = OBSTrackedStatuses.OFF;
      sendInGameCmdMessage(mod)(Messages.OBSAlreadyKilled);
    }
  });
};

const loadCommands = (mod) => {
  mod.command.add("obs", {
    start: () => {
      launchOBSOBS(mod);
    },
    stop: () => {
      killOBS(mod);
    },
    help: () => {
      sendInGameCmdMessage(mod)(Messages.AvailableCommands);
    },
    $none: () => {
      sendInGameCmdMessage(mod)(Messages.OBSCurrentStatus(obsStatus));
    },
  });
};

module.exports = { loadCommands };
