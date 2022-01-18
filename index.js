import "./style.css";

// RECOMMENDED: Disconnect HEROKU from Github before doing this (though not strictly necessary, I think).
//See https://stackoverflow.com/a/61272173/6569950 for more info.

// PARAMETERS
const TOKEN = ""; // MUST BE `repo_deployments` authorized
const REPO = ""; // e.g. "monorepo"
const USER_OR_ORG = ""; // e.g. "your-name"

// GLOBAL VARS
const URL = `https://api.github.com/repos/${USER_OR_ORG}/${REPO}/deployments`;
const AUTH_HEADER = `token ${TOKEN}`;

// UTILITY FUNCTIONS
const getAllDeployments = () =>
  fetch(`${URL}`, { headers: { authorization: AUTH_HEADER } }).then(val => val.json());

const makeDeploymentInactive = id =>
  fetch(`${URL}/${id}/statuses`, {
    method: "POST",
    body: JSON.stringify({ state: "inactive" }),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/vnd.github.ant-man-preview+json",
      authorization: AUTH_HEADER
    }
  }).then(() => id);

const deleteDeployment = id =>
  fetch(`${URL}/${id}`, {
    method: "DELETE",
    headers: { authorization: AUTH_HEADER }
  }).then(() => id);

// MAIN
getAllDeployments()
  .catch(console.error)
  .then(res => {
    console.log(`${res.length} deployments found`);
    return res;
  })
  .then(val => val.map(({ id }) => id))
  .then(ids => Promise.all(ids.map(id => makeDeploymentInactive(id))))
  .then(res => {
    console.log(`${res.length} deployments marked as "inactive"`);
    return res;
  })
  .then(ids => Promise.all(ids.map(id => deleteDeployment(id))))
  .then(res => {
    console.log(`${res.length} deployments deleted`);
    return res;
  })
  .then(finalResult => {
    const appDiv = document.getElementById("app");
    appDiv.innerHTML = `
<h1>CLEANUP RESULT</h1>
<br>
Removed Deployments: ${finalResult.length}
<br>
<br>Ids:<br>
${JSON.stringify(finalResult)}
<br><br><br><br><br><br>
  <p>(Open up the console)</p>
`;
  });
