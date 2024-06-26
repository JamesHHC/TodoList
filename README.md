# Another Todo List
This is just meant to be a simple todo list app to keep me in practice and potentially get a useful tool out of. The inevitable feature creep will also be a good opportunity to learn some new things.
<br>

### Packaging with Electron
After setting up your node modules, the application can be run using the _\_start-electron.bat_ file for development purposes. Otherwise, _\_npm-build.bat_ will create a build of the app under a new folder. The _\_winstaller.bat_ batch file is intended to be ran after a build is created in order to create an installer. Currently, I only intend to develop this for use with Windows since that's all I'll use it for.

### Feature Creep
With a majority of the initial work being done, here's some of my plans for how I can needlessly increase the complexity of this project:
- [X] Add drag & drop for the list, at least in default sort mode (rename to custom or add custom sort option?)
	- I'd likely need to maintain a separate db to track the user-assigned order of the items
- [X] Dark mode
- [ ] ~Installer options to make start/desktop icons optional~ (Would need custom NSIS installer)
- [ ] Figure out how squirrel updates work
- [ ] Add editing for existing items
- [ ] Add special section for tasks dated for today
	- What about items without a date?
	- Could be added via special sort option or highlighting
- [ ] Undo recent delete option
	- Could be a popup that hovers at the bottom of the screen for a few seconds
- [ ] Deleted items archive
	- May just be for last _x_ items, rather than all
- [ ] Add message where tasks are shown when all items are completed 
- [ ] Counters/stats
	- Completed items count, subcategories based on priority, etc.
- [ ] In-app clock

Some of these are just ideas, I won't necessarily actually add all this.
