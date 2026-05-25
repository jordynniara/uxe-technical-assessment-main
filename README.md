# UXE Technical Assessment

This is an ATPCO UXE technical assessment. ATPCO has its own design system, the Lift Design System, which is utilized in many of its products. This assessment is meant to familiarize you with the system, in addition to allowing you to showcase your frontend engineering skills, and your ability to integrate an API with a form. Lift Design System documentation can be found at [http://d2vz07p3m3c4xg.cloudfront.net/](http://d2vz07p3m3c4xg.cloudfront.net/).

Please access [this Figma mockup](https://www.figma.com/design/9tdkaFs4cMfI358ad5NriK/UXE-Technical-Assessment-Form?node-id=0-1&m=dev) of a modified version of an ATPCO application's Create Delivery Configuration form. There are mockups showing the form unfilled and with the form filled and the menus expanded. The Figma file password will be provided by your recruiter.

Most of the UI elements in the mockup have corresponding design system components. We provide both Angular and React starter applications. ATPCO primarily uses Angular, but if you feel you'll be able to do your best work in a React context, use the React Router based starter app. Please implement it in one of the starter apps at the route `http://localhost:4200/delivery-configuration/create`. Some of the basic page components (header, sidebar) have already been implemented for you.

There is a basic API app that includes endpoints for GET and POST. Your implementation should: 1) Successfully POST data and display a success indicator of your choosing OR if an error occurs, an error indicator of your choosing. For testing convenience, adding `?error=true` to the POST will cause an error response. 2) On load the form page should utilize the GET request to log an array of the existing configs stored in the "backend" in the developer console. The configs in the array should be ordered by `acceptedAt` time from oldest -> most recent.

The finished application should build successfully with no errors. 

The expectation is that you will spend around 90 minutes on this assessment and will be prepared to discuss your work during your interviews.

## Prerequisites:

- `node v22.14.0` (recommended version, atp-web package has not been verified for usage with other versions)

## To get started:

1. Install `node_modules` with `npm install`.

2. Run `npm run dev:tech-assessment-angular-mode` or `npm run dev:tech-assessment-react-mode` to run the client app and API locally.

3. Implement the Figma design and connect your form to the provided local API.

4. Run `npx nx build tech-assessment-angular` or `npx nx build tech-assessment-react` to build the client app.

## Local API

A local-only API is available at `apps/tech-assessment-api/server.mjs`.

API routes:
- `GET /api/three-v-deliveries`
- `POST /api/three-v-deliveries`

The app dev server proxies `/api/*` to `http://localhost:3333` via `apps/tech-assessment-angular/proxy.conf.json` or in the react app, the vite.config.mts.

Sample POST with a full payload matching `ThreeVDelivery`.
Run the command from the workspace root folder:

```sh
curl -X POST http://localhost:3333/api/three-v-deliveries \
  -H "Content-Type: application/json" \
  --data @apps/tech-assessment-api/sample-payload.json
```

For the basic payload schema, see `apps/tech-assessment-api/schema.md`.

## Notes

- Use the Lift Design System components to complete this task.

- You are welcome to send questions to your recruiter about the project. These will be considered as part of your assessment, with quality questions and feedback considered a plus.

- You may use AI to assist you, but be prepared to discuss all aspects of your solution in your technical interview. A lack of understanding of an AI built solution will be a significant negative.

- The assessment has options for [Angular](https://angular.dev/overview), as that is what ATPCO primarily uses for client-side development. It also has a [React Router](https://reactrouter.com/start/framework/installation) (in Framework mode) option.

- The UXE team uses [nvm](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating) to manage node versions and we recommend using it to install the recommended `node v22.14.0`
