(function() {

    var issue = HMRCSTATS.getUrlParameter('issue');
    var quarter = HMRCSTATS.getUrlParameter('quarter');

    document.querySelector('#issue-heading').textContent = HMRCSTATS.formattedIssue(issue);

    window.onload = function() {
        HMRCSTATS.getJSON('/assets/json/stats.json', dataCallback);
    }

    /**
     * dataCallback
     * 
     * @param {*} err 
     * @param {*} data 
     */
     function dataCallback(err, data) {
        if (err !== null) {
            return;
        }

        if (!HMRCSTATS.checkQuarter(quarter, data)) {
            document.querySelector('#page-intro').innerHTML = 'Sorry, there is no data available for the selected time period.';
            document.querySelector('#page-content').style.display = 'none';

            return;
        }

        HMRCSTATS.addQuarterDetails(quarter, 'quarterDetails');
        
        HMRCSTATS.getJSON('/assets/json/details-' + quarter + '.json', issuesCallback);
     }

    /**
     * issuesCallback
     * 
     * @param {*} err 
     * @param {*} data 
     */
    function issuesCallback(err, data) {
        if (err === null) {
            populateDataTable('top-issues-list', data, 'component', 3, 'violations', 'chart1', 'bar');
            populateDataTable('top-issues-list2', data, 'pattern', 3, 'violations', 'chart2', 'bar');
            populateDataTable('top-issues-list3', data, 'Auditing: ', 2, null, 'chart3', 'pie');
            populateDataTable('top-issues-list4', data, 'Audit task: ', 3, null, 'chart4', 'bar');
        } 
        else {
            console.log(err);
        }
    }

    /**
     * populateDataTable
     * 
     * @param {*} id 
     * @param {*} data 
     * @param {*} filter 
     * @param {*} cols 
     * @param {*} exclude 
     * @param {*} chartId 
     * @param {*} chartType 
     */
    function populateDataTable(id, data, filter, cols, exclude, chartId, chartType) {
  
        var tableRows = '';
        var labels = [];
        var issues = [];

        HMRCSTATS.cleanData(data);

        for (var i = 0; i < data.length; i++) {
            if (data[i].label !== issue) {
                continue;
            }

            if (data[i].labels) {
                for (var n = 0; n < data[i].labels.length; n++) {

                    // filter tasks
                    if (data[i].labels[n].label.indexOf('library source') > -1) {
                        continue;
                    }
                    
                    var description = data[i].labels[n].description;
                    if (description.indexOf(filter) === -1 || description.indexOf(exclude) > -1) {
                        continue;
                    }
              
                    var label = HMRCSTATS.capitalise(data[i].labels[n].label);
                    
                    tableRows += '<tr class="govuk-table__row"><td class="govuk-table__cell">' + label + '</td>';
                    
                    if (cols === 3) {
                        tableRows += '<td class="govuk-table__cell">' + HMRCSTATS.capitalise(data[i].labels[n].description.replace(filter, '')) + '</td>';
                    }
                    tableRows += '<td class="govuk-table__cell govuk-table__cell--numeric"><a class="govuk-link" href="/stats/issue-details.html?issue=' + encodeURIComponent(data[i].label) + '&detail=' + encodeURIComponent(data[i].labels[n].label) + '&quarter=' + quarter + '">' + data[i].labels[n].count + '</a></td></tr>';
                 
                    labels.push(label);
                    issues.push(data[i].labels[n].count);
                }
            }

            populateChart( chartId, chartType, labels, issues);
        }

        document.querySelector('#' + id).innerHTML = tableRows;
    }
    
    /**
     * populateChart
     * 
     * @param {*} id 
     * @param {*} type 
     * @param {*} labels 
     * @param {*} issues 
     * @returns 
     */
    function populateChart(id, type, labels, issues) {
        var colorScheme = [
            "#00703c","#2980b9","#8e44ad","#2c3e50","#f1c40f",
            "#e67e22","#e74c3c","#95a5a6","#f39c12","#d35400",
            "#c0392b","#bdc3c7","#7f8c8d","#55efc4","#81ecec",
            "#74b9ff","#a29bfe","#dfe6e9","#00b894","#00cec9",
            "#0984e3","#6c5ce7","#ffeaa7","#fab1a0","#ff7675",
            "#fd79a8","#fdcb6e","#e17055","#d63031","#feca57",
            "#5f27cd","#54a0ff","#01a3a4","#25CCF7","#FD7272",
            "#54a0ff","#00d2d3","#16a085","#1abc9c","#2ecc71",
            "#3498db","#9b59b6","#34495e","#27ae60","#ecf0f1"
        ];

        var canvas = document.getElementById(id);

        if (!canvas) {
            return;
        }

        var scales = {}

        if (type === 'bar') {
            scales = {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        stepSize: 1
                    }
                }]
            };
        }

        var ctx = canvas.getContext('2d');
          
        var chart = new Chart(ctx, {
            type: type,
            data: {
                labels: labels,
                datasets: [{
                    label: '# of Issues',
                    data: issues,
                    backgroundColor: colorScheme
                }]
            },
            options: {
                scales: scales,
                responsive: true,
                maintainAspectRatio: false,
                title: {
                    display: false,
                    text: 'Top 5 WCAG Issues'
                },
                legend: {
                    display: type === 'pie'
                }
            }
        });
    }
})();
