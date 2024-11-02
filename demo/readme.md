## Demo/test extension for `webext-msg`

Run these 3 commands simultaneusly at the root of the project to manually test the module:

```sh
npm run watch
```

```sh
npm run demo:watch
```

```sh
npx -y web-ext run
```

### Testing method

1. Open the background worker's console
2. Open https://example.com/
3. Click anywhere on the page to message the background worker
4. Click the extension's Action button in the browser toolbar to have the background worker send a message to the current tab
