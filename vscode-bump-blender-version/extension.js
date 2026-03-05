const vscode = require("vscode");

const VERSION_REGEX = /^version\s*=\s*"(\d+)\.(\d+)\.(\d+)"/m;

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand("bumpBlenderAddonVersion.run", async () => {
      const manifestUris = await vscode.workspace.findFiles(
        "**/blender_manifest.toml",
        "**/node_modules/**"
      );
      if (manifestUris.length === 0) {
        vscode.window.showErrorMessage("No blender_manifest.toml found in this workspace.");
        return;
      }
      const uri = manifestUris[0];

      const doc = await vscode.workspace.openTextDocument(uri);
      const text = doc.getText();
      const match = text.match(VERSION_REGEX);
      if (!match) {
        vscode.window.showErrorMessage(
          'No version = "X.Y.Z" line found in blender_manifest.toml.'
        );
        return;
      }

      const major = match[1];
      const minor = match[2];
      const patch = String(Number(match[3]) + 1);
      const newVersion = `${major}.${minor}.${patch}`;
      const newText = text.replace(VERSION_REGEX, `version = "${newVersion}"`);

      const edit = new vscode.WorkspaceEdit();
      edit.replace(uri, new vscode.Range(0, 0, doc.lineCount, 0), newText);
      await vscode.workspace.applyEdit(edit);

      vscode.window.showInformationMessage(`Bumped addon version to ${newVersion}`);
    })
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
