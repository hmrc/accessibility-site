(function() {

    var issue = HMRCSTATS.getUrlParameter('issue');
    var detail = HMRCSTATS.getUrlParameter('detail');
    var quarter = HMRCSTATS.getUrlParameter('quarter');

    document.querySelector('#issue-heading').textContent = HMRCSTATS.capitalise(detail);

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
            quarter = HMRCSTATS.getQuarter(data);
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
            var listItems = '';
        
            HMRCSTATS.cleanData(data);

            for (var i = 0; i < 5; i++) {
                if (data[i].label !== issue) {
                    continue;
                }

                if (data[i].labels) {
                    for (var n = 0; n < data[i].labels.length; n++) {
                        if (data[i].labels[n].label !== detail) {
                            continue;
                        }

                        for (var x = 0; x < data[i].labels[n].issues.length; x++) {
                            listItems += '<li>' + HMRCSTATS.escape(data[i].labels[n].issues[x]) + '</li>';
                        }
                    }
                }
            }

            document.querySelector('#issue-list').innerHTML = listItems;
        } 
        else {
            console.log(err);
        }
    }
})();
