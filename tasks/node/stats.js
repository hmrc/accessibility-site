#!/usr/bin/env node

const fs = require('fs');

let accessToken;
let labels = [];
let issues = [];
let details = [];
let stats = [];
let requestCount = 0;

try {
    const data = fs.readFileSync('./token', 'utf8');
    accessToken = data.trim();
} 
catch (err) {
    console.error(err);
    process.exit(1);
}

const { Octokit } = require("@octokit/rest");
const { exit } = require('process');

const octokit = new Octokit({
    auth: accessToken
});

// -------------------------------------
// Get quarter
//
// Jan - March = 1
// April - June = 2
// July - September = 3
// October - December = 4
// -------------------------------------
function getQuarter(date) {
    const quarters = [4,1,2,3];
    
    return quarters[Math.floor(date.getMonth() / 3)];
}

// -------------------------------------
// Get start date 
//
// Format: YYYY-MM-DDTHH:MM:SSZ
// -------------------------------------
function getStartDate(date) {
    const quarterDates = [10,1,4,7];
    const quarterMonth = '0' + quarterDates[Math.floor(date.getMonth() / 3)];

    date.setMonth(date.getMonth() - 3); // Rewind to previous quarter

    return date.getFullYear() + '-' + quarterMonth.slice(-2) + '-01T00:00:00.000Z';
}

// -------------------------------------
// Get end date 
//
// Format: Date
// -------------------------------------
function getEndDate(date) {
    const quarterDates = [3,6,9,12];
    const quarterMonth = quarterDates[Math.floor(date.getMonth() / 3)];

    date.setMonth(quarterMonth); // First month of current quarter
    const lastDay = new Date(date.getFullYear(), date.getMonth(), 0);

    return date.getFullYear() + '-' + ('0' + date.getMonth()).slice(-2) + '-' + lastDay.getDate() + 'T00:00:00.000Z';
}

const date = new Date();
const statId = date.getFullYear() + '-' + getQuarter(date);
const startDate = getStartDate(date);
const endDate = new Date(getEndDate(date));

try {
    const statsFile = fs.readFileSync(`./application/assets/json/stats.json`, 'utf8');
    stats = JSON.parse(statsFile);

    if (stats[statId] > -1 && stats[statId] === true) {
        console.log('Stats already exist for this quarter');
        process.exit(0);
    }
}
catch (err) {
    console.error(err);
    process.exit(1);
}

// -------------------------------------
// Get labels
// -------------------------------------

console.log(`1. Get labels for repo accessibility-audits-external`);

getLabels(1);

function getLabels(page) {

    console.log(`2. Getting data for page ${page}`);

    octokit.issues.listLabelsForRepo({
        owner: "hmrc",
        repo: "accessibility-audits-external",
        per_page: 100,
        page: page
    })
    .then(({ data }) => {
    
        if (data.length === 0) {

            // -------------------------------------
            // Get number of WCAG issues
            // -------------------------------------

            console.log(`3. Getting the number of issues for each WCAG criteria`);

            labels.forEach(label => {
                if (label.name.indexOf("wcag") > -1 && label.name !== 'wcag') {
                    getIssues(label);
                }
            });

            return;
        }

        labels.push.apply(labels, data);

        page = page + 1;

        getLabels(page);
    });
}

function getIssues(label) {
    requestCount++;

    octokit.issues.listForRepo({
        owner: "hmrc",
        repo: "accessibility-audits-external",
        labels: label.name,
        state: "all",
        since: startDate,
        per_page: 100
    })
    .then(({ data }) => {

        // Remove any issues not in current quarter
        var result = data.filter(i => new Date(i.created_at) < endDate);

        const issueJSON = {label: label.name, description: label.description, issues: result.length}
        issues.push(issueJSON);
        requestCount--;

        if (requestCount === 0) {
            console.log(`4. Saving data file issues.json`);
        
            try {
                fs.writeFileSync(`./application/assets/json/issues-${statId}.json`, JSON.stringify(issues));
            } catch (err) {
                console.error(err);
            }

            getDetails();
        }
    });
}

// -------------------------------------
// Get details for top 5 issues
// -------------------------------------
function getDetails() {
    issues.sort( function( a, b ) {
        return a.issues > b.issues ? -1 : a.issues < b.issues ? 1 : 0;
    });

    const topFive = issues.slice(0,5);

    console.log(`5. Getting details of top 5 issues`);

    requestCount = 0;

    topFive.forEach(item => {
        getAllLabelsForIssue(item.label);
    });
}

function getAllLabelsForIssue(label) {
    requestCount++;

    octokit.issues.listForRepo({
        owner: "hmrc",
        repo: "accessibility-audits-external",
        labels: label,
        state: "all",
        since: startDate,
        per_page: 100
    })
    .then(({ data }) => {
        
        let labels = [];

        data.forEach(issue => {
            issue.labels.forEach(label => {

                let newLabel = true;

                for (var i = 0; i < labels.length; i++) {
                    if (labels[i].label === label.name) {
                         labels[i].count = labels[i].count + 1;
                         labels[i].issues.push(formattedTitle(issue));
                         newLabel = false;
                         break;
                    }
                }

                if (newLabel) {
                    let issues = [];
                    issues.push(formattedTitle(issue));
                    labels.push({label: label.name, description: label.description, count: 1, issues: issues});
                }
            });

        });

        labels.sort( function( a, b ) {
            return a.count > b.count ? -1 : a.count < b.count ? 1 : 0;
        });

        const detailsJSON = {label: label, labels: labels}
        details.push(detailsJSON);
        
        requestCount--;

        if (requestCount === 0) {

            console.log(`6. Saving data file details.json`);
    
            try {
                fs.writeFileSync(`./application/assets/json/details-${statId}.json`, JSON.stringify(details));

                stats[statId] = true;
                fs.writeFileSync(`./application/assets/json/stats.json`, JSON.stringify(stats));
            } catch (err) {
                console.error(err);
            }
        }
    });
}

function formattedTitle(issue) {
    let title = issue.title.replace('Issue:', '');
    title = title.replace('[FIXED]', '');
    title = title.replace('[DRAFT]', '');
    title = title.replace('(AAA)', '');
    title = title.replace('(AA)', '');
    title = title.replace('(A)', '');
    return title.trim();
}
