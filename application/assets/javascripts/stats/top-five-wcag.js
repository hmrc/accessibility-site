(function() {

    var quarter = HMRCSTATS.getUrlParameter('quarter');
    var myChart;

    window.onload = function() {
        // If no quarter passed in use current
        if (!quarter) {
            quarter = HMRCSTATS.getCurrentQuarter();
        }

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
            
            return;
        }
        
        quarter = HMRCSTATS.getQuarter(data);

        HMRCSTATS.addQuarterDetails(quarter, 'quarterDetails');

        HMRCSTATS.getJSON('/assets/json/issues-' + quarter + '.json', issuesCallback);
     }

    /**
     * issuesCallback
     * 
     * @param {*} err 
     * @param {*} data 
     */
    function issuesCallback(err, data) {
      if (err === null) {


          data.sort( function( a, b ) {
              return a.issues > b.issues ? -1 : a.issues < b.issues ? 1 : 0;
          });

          var tableRows = '';
          var labels = [];
          var issues = [];
          var color = [];

          for (var i = 0; i < 5; i++) {
              if (data[i].issues !== 0) {
                tableRows += '<tr class="govuk-table__row"><td class="govuk-table__cell">' + data[i].label + '</td>';
                tableRows += '<td class="govuk-table__cell">' + data[i].description + '</td>';
                tableRows += '<td class="govuk-table__cell govuk-table__cell--numeric"><a class="govuk-link" href="/stats/issues.html?issue=' + encodeURIComponent(data[i].label) + '&quarter=' + quarter + '">' + data[i].issues + '</a></td></tr>';
                
                labels.push(data[i].label);
                issues.push(data[i].issues);
                color.push('#00703c');
              }
          }

          document.querySelector('#top-issues-list').innerHTML = tableRows;

          chartData = data;

          var ctx = document.getElementById('wcagChart').getContext('2d');
          if (myChart) {
              myChart.destroy();
          }
          myChart = new Chart(ctx, {
              type: 'bar',
              data: {
                  labels: labels,
                  datasets: [{
                      label: '# of Issues',
                      data: issues,
                      backgroundColor: color
                  }]
              },
              options: {
                  scales: {
                      yAxes: [{
                          ticks: {
                              beginAtZero: true,
                              stepSize: 1
                          }
                      }]
                  },
                  responsive: true,
                  maintainAspectRatio: false,
                  title: {
                      display: false,
                      text: 'Top 5 WCAG Issues'
                  },
                  legend: {
                      display: false
                  }
              }
          });

          document.querySelector('#page-intro').innerHTML = 'The top 5 WCAG failures reported for services audited by our team in <span id="quarterDetails"></span>.';
          document.querySelector('#page-content').style.display = 'block';
          

      } 
      else {
          console.log(err);
      }
  }

})();
