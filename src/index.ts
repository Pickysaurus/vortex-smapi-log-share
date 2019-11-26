import { remote, clipboard } from 'electron';
import { selectors, types, util } from 'vortex-api';
import * as path from 'path';
import * as fs from 'fs';

const GAME_ID = 'stardewvalley';

function main(context: types.IExtensionContext) {
      context.registerAction('mod-icons', 999, 'changelog', {}, 'SMAPI Log', 
    () => {
      //Read and display the log.
      const basePath = path.join(remote.app.getPath('appData'), 'stardewvalley', 'errorlogs');
      //If the crash log exists, show that.
      if (fs.existsSync(path.join(basePath, 'SMAPI-crash.txt'))) return showSMAPILog(context.api, basePath, "SMAPI-crash.txt");
      //Otherwise show the normal log.
      else if (fs.existsSync(path.join(basePath, 'SMAPI-latest.txt'))) return showSMAPILog(context.api, basePath, "SMAPI-latest.txt");
      //Or Inform the user there are no logs.
      else {
        context.api.sendNotification({type: 'info', title: 'No SMAPI logs found.', message:'', displayMS: 5000});
      };
    }, 
    () => {
      //Only show the SMAPI log button for SDV. 
      const state = context.api.store.getState();
      const gameMode = selectors.activeGameId(state);
      return (gameMode === GAME_ID);
    });
  return true;
}

function showSMAPILog(api, basePath : string, logFile: string) {
  const logData = fs.readFileSync(path.join(basePath, logFile)).toString();
  api.showDialog('info', 'SMAPI Log', {
    text: 'Your SMAPI log is displayed below. To share it, click "Copy & Share" which will copy it to your clipboard and open the SMAPI log sharing website. '+
    'Next, paste your code into the text box and press "save & parse log". You can now share a link to this page with others so they can see your log file.\n\n'+logData
  }, [{ label: 'Copy & Share log', action: () => {
    const timestamp = new Date().toISOString().replace(/^.+T([^\.]+).+/, '$1');
    clipboard.writeText(`[${timestamp} INFO Vortex] Log exported by Vortex ${remote.app.getVersion()}.\n`+logData);
    util.opn('https://smapi.io/log').catch(err => console.log(err));
  }}, { label: 'Close', action: () => undefined }]);
}

export default main;
