Simple Node/React/Express/Mongo based quadratic survey app.

Install instructions:
```
  Install Node and MongoDB.
  generate a configuration file at server/config.json following the format in server/exampleconfig.json
  cd client && nvm use && npm run build
  cd ../server && mkdir logs && node index
  ```

Paths are set up to be hosted at / for local testing and at yourdomain.net/quad for deployment - you'll need to modify the regexes in client/src/App.js and server/index.js to fit your setup.

This app is not built securely, and there are no efforts made to prevent duplicate votes beyond very basic cookie tracking - do not use in environments where not all participants can be trusted!