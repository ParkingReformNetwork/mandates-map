# Parking Reform Network Map

This code runs the Mandates Map app for the Parking Reform Network: https://parkingreform.org/mandates-map/.

The scripts are written in JavaScript and the app in R. We want to rewrite the app to JavaScript.

# Running the map app

## JavaScript Migration

We are currently migrating from R to JavaScript. We are taking inspiration from the [Parking Lot Map](https://github.com/ParkingReformNetwork/parking-lot-map).

1. Install [Node Package Manager (npm)](https://nodejs.dev/en/download/).
2. If you are using Windows OS, install [Windows Subsystem for Linux (WSL)](https://learn.microsoft.com/en-us/windows/wsl/install). Open a wsl terminal in this repositoy and use `npm i` to reconfigure npm for Linux.

### Start the development server

```bash
❯ npm start
```

Then open http://127.0.0.1:1234 in a browser. Hit `CTRL-C` to stop the development server.

When the server is running, you can make any changes you want to the project. Reload the page in the browser to see those changes. (You may need to force reload, e.g. hold the shift key while reloading on macOS.)

### Run tests

```bash
❯ npm test
```

Currently, our tests are for the data import scripts.

Will be adding more tests.

If the tests are taking a long time to start, run `rm -rf .parcel-cache` and try the tests again.

### Autoformat code

Using prettier to nicely format code.

```bash
❯ npm run fmt
```

Before pushing code, run this command and commit the changes. Otherwise, PR checks will not pass.

### Lint code

"Linting" means using tools that check for common issues that may be bugs or low code quality.

```bash
❯ npm run lint
```

### Try out a build locally

You can preview what a build will look like by running `npm run build`. Then use `npm run serve-dist` to start the server. A 'build' are the files sent for production on the real site. This is slightly different from the development server run by `npm start`, which prioritizes a quick start for development.

`npm run test-dist` will be implemented soon, while `npm test` is the development equivalent.

### Staging (to be implemented)

### Production (to be implemented)

## Legacy R map

### Dependencies

The app is built in [Shiny](https://shiny.rstudio.com/), so you need to install:

- System software:
  - R ('r-base' in Debian/Ubuntu)
  - libcurl4-openssl-dev (`libcurl4-openssl-dev` in Debian/Ubuntu)
  - libgdal-dev (`libgdal-dev` in Debian/Ubuntu)
  - libssl-dev (`libssl-dev`in Debian/Ubuntu)
- R libraries for local development:
  - `dplyr`
  - `fontawesome`
  - `leaflet`
  - `R.rsp`
  - `shiny`
  - `shinyjs`
  - `stringr`
- R libraries for [shinyapps.io](shinyapps.io) deployment:
  - `anytime`
  - `BH`
  - `shinyWidgets`

### Executing program

In the R console, run:

```
library(shiny)
runApp('map')
```

Go to `localhost:[provided port]` in a browser

## Updating the data

You usually should not need to manually do this. We have a GitHub Action that runs every night to open a PR with any updates.

First, `npm install`. Then, run either:

- `npm run update-map-data`, or
- `npm run update-city-detail`.

### Update latitude and longitude

1. Save a CSV file called `update-lat-lng.csv` in the root of the repository. It should have five columns: the city, state code, country code, latitude, and longitude. The top row should be headers.
2. `npm install`
3. `npm run update-lat-lng`

## Authors

- Brad Baker [@bradmbak](https://twitter.com/bradmbak)
- Alireza Karduni
- Devin Macarthur
- Tony Jordan [@twjpdx23](https://twitter.com/twjpdx23)
- Aaron Snailwood
- Justin Ross
- complete acknowledgements for the project can be found [here](https://parkingreform.org/mandates-map/acknowledgments.html)
