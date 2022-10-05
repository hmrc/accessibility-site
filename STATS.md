## Updating auditing stats

The data is a snapshot in time using the Github API and the results are stored as JSON which the webpages use to display the results.

### Before you start - Create token

Create a [personal github access token](https://github.com/settings/tokens) and save it into the root of the project in a file named `token`

__Note:__ The `token` filename has been added to the `.gitignore` file and care must be taken not to expose your private token.

### Update

To create the stats for the current quarter run the following command:

```
npm run stats
```

This will create a new json data files within the `assets/json` folder.

Check the data has updated correctly at - http://localhost:3000/stats/
