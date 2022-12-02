

const URL = "https://api.sheety.co/a5bb71fdb9384d8f554ceed86a2f3c28/financialStatus/copyOfMonthlyBalance"
var headers = new Headers();
headers.append("Authorization", "Basic c3lhcmlmOnNheWFrYW11");




const MAIN_CURRENCY = 'IDR'

async function fetchData(username, password) {
    try {

        var headers = new Headers();
        headers.append("Authorization", `Basic ${btoa(username+":"+password)}`);
        const res = await fetch(URL, { method: "GET",headers:headers })
        const data = await res.json();
        for (let account of data.copyOfMonthlyBalance) {

            var entries = []
            //remove name, active, type, currency, and id
            var keys = Object.keys(account).filter((val) => val != 'name' && val != "active" && val != "type" && val != 'currency' && val != "id")
            for (let key of keys) {
                var year = key.slice(key.length - 4);
                var month = key.slice(0, key.length - 4);
                if (month.length == 1) month = '0' + month


                entries.push({
                    amount: account[key] != '' ? parseFloat(account[key]) : 0,
                    year: parseInt(year),
                    month: parseInt(month),
                    index: parseInt(year + month),
                    title: `${month} - ${year}`
                })
                delete account[key]
            }
            account['entries'] = entries.sort((a, b) => (b.index - a.index))
        }
        return data.copyOfMonthlyBalance;
    }
    catch(e){
        return undefined;
    }
}

async function getRate(month, year, from, to) {
    var date = new Date(year, month)
    var url = `https://api.exchangerate.host/${date.toISOString().split('T')[0]}?base=${from}&symbols=${to}`
    var rate = localStorage.getItem(url)
    if (rate) {
        rate
    }
    else {
        const res = await fetch(url, { method: 'GET' })
        const data = await res.json();
        rate = parseFloat(data.rates[to]);
        localStorage.setItem(url, rate);
        return rate;
    }

    //return 10000
}

async function buildSummary(data) {

    var summary =
    {
        trend: [
            {
                main: true,
                currency: MAIN_CURRENCY,
                title: 'TOTAL',
                entries: []
            }
        ],
        proporsion: [
            /**
             * {
             *  account:'OCBC'
             *  amount:9939,
             *  conversion:100000
             *
             * }
             */
        ]
    }
    /**
     * Trend Computation
     */
    for (let account of data) {
        currencySummary = summary.trend.find((val) => val.main == false && val.currency == account.currency);

        if (!currencySummary) {
            currencySummary = {
                main: false,
                currency: account.currency,
                title: account.currency,
                entries: []
            }
            summary.trend.push(currencySummary)
        }

        for (let entry of account.entries) {

            summaryEntry = currencySummary.entries.find((val) => val.index == entry.index);
            if (!summaryEntry) {
                summaryEntry = {
                    index: entry.index,
                    month: entry.month,
                    year: entry.year,
                    amount: 0
                }
                currencySummary.entries.push(summaryEntry)
            }

            summaryEntry.amount += entry.amount

        }


    }

    //compute the total in the main summary
    mainSummary = summary.trend.find((val) => val.main);
    for (let currencySummary of summary.trend) {
        if (currencySummary.main) continue;

        for (let entry of currencySummary.entries) {
            if (currencySummary.currency != mainSummary.currency) {
                entry['rate'] = await getRate(entry.month, entry.year, currencySummary.currency, mainSummary.currency)
                entry['conversion'] = entry.amount * entry.rate;
            }
            else {
                entry['conversion'] = entry.amount;
            }

            //add to main summary
            var mainEntry = mainSummary.entries.find((val) => val.index == entry.index)
            if (!mainEntry) {
                mainEntry = {
                    index: entry.index,
                    month: entry.month,
                    year: entry.year,
                    amount: 0
                }
                mainSummary.entries.push(mainEntry)
            }
            mainEntry.amount += entry.conversion;
        }


    }


    for (let currencySummary of summary.trend) {
        for (let i = 0; i < currencySummary.entries.length; i++) {

            //get the data needed
            var cur = currencySummary.entries[i];
            if (i < currencySummary.entries.length - 1) {
                //only compute the non first index
                var pre = currencySummary.entries[i + 1]
                var first = currencySummary.entries[currencySummary.entries.length - 1];
                var yearEntries = currencySummary.entries.filter((val) => val.year == cur.year);
                var firstMonth = yearEntries[yearEntries.length - 1]

                //compute increment
                cur['monthly'] = cur.amount - pre.amount;
                cur['monthlyPer'] = cur['monthly'] * 100 / pre.amount
                cur['yearToDate'] = cur.amount - firstMonth.amount;
                cur['yearToDatePer'] = cur['yearToDate'] * 100 / firstMonth.amount
                cur['total'] = cur.amount - first.amount;
                cur['totalPer'] = cur['total'] * 100 / first.amount
            }

        }
    }

    /**
     * End of Trend Computation
     */


    /**
     * Proporsion Conversion
     */

    for (let account of data) {
        //only show that is active
        if (account.active == 'No') continue;

        entry = {
            account: account.name,
            amount: account.entries[0].amount
        }

        if (account.currency != MAIN_CURRENCY) {
            rate = await getRate(account.entries[0].month, account.entries[0].year, account.currency, MAIN_CURRENCY);
            amout = account.entries[0].amount
            entry['conversion'] = rate * amout;
        }
        else {
            entry['conversion'] = account.entries[0].amount
        }

        entry['percentage'] = entry.conversion * 100 / mainSummary.entries[0].amount;
        summary.proporsion.push(entry)

    }

    summary.proporsion = summary.proporsion.sort((a, b) => b.conversion - a.conversion)

    /**
     * End Proporsion Conversion
     */

    return summary;
}


function displayAccountTable(data) {

    var tableSource = JSON.parse(JSON.stringify(data))

    //initialize table
    var columns = [
        { field: "name", title: "Name" },
        { field: "active", title: "Active" },
        { field: "type", title: "Type" },
        { field: "currency", title: "Currency" },
    ]

    //see the data and sort by keys
    for (let account of tableSource) {

        for (let entry of account.entries) {
            //check if the year already exist in col
            var year_col = columns.find((col) => parseInt(col.title) == entry.year);
            if (!year_col) {
                year_col = {
                    title: `${entry.year}`,
                    columns: []
                }
                columns.push(year_col);
            }

            var month_col = year_col.columns.find((col) => parseInt(col.field) == entry.index)
            if (!month_col) {
                month_col = {
                    field: `${entry.index}`,
                    title: `${entry.month}`,
                    formatter: "money"
                }
                year_col.columns.push(month_col)
            }
        }
    }

    //modify the data so it has proper field
    for (let account of tableSource) {

        for (let entry of account.entries) {
            account[entry.index] = entry.amount;
        }
        delete account.entries
    }

    new Tabulator("#maintable", {
        data: tableSource, //assign data to table
        columns: columns
    });
}

function displayTrendTable(summary) {

    var trendSource = JSON.parse(JSON.stringify(summary.trend));


    //initialize table
    var columns = [
        { field: "title", title: "Trend", width: 200, }
    ]

    for (let currencyTrend of trendSource) {
        for (let entry of currencyTrend.entries) {
            //check if the year already exist in col
            var year_col = columns.find((col) => parseInt(col.title) == entry.year);
            if (!year_col) {
                year_col = {
                    title: `${entry.year}`,
                    columns: []
                }
                columns.push(year_col);
            }

            var month_col = year_col.columns.find((col) => parseInt(col.field) == entry.index)
            if (!month_col) {
                month_col = {
                    field: `${entry.index}`,
                    title: `${entry.month}`,
                    formatter: "money"
                }
                year_col.columns.push(month_col)
            }
        }
    }


    //modify the data so it has proper field
    mainTrend = trendSource.find((val) => val.main);
    for (let currencyTrend of trendSource) {
        currencyTrend['_children'] = [
            {
                'title': 'monthly'
            },
            {
                'title': 'monthly %'
            },
            {
                'title': 'year to date'
            },
            {
                'title': 'year to date %'
            },
            {
                'title': 'total'
            },
            {
                'title': 'total %'
            }
        ]

        if (currencyTrend.currency != mainTrend.currency) {
            currencyTrend['_children'].push(
                {
                    'title': 'rate'
                }
            )
        }

        for (let entry of currencyTrend.entries) {
            currencyTrend[entry.index] = entry.amount;
            currencyTrend['_children'][0][entry.index] = entry.monthly
            currencyTrend['_children'][1][entry.index] = entry.monthlyPer
            currencyTrend['_children'][2][entry.index] = entry.yearToDate
            currencyTrend['_children'][3][entry.index] = entry.yearToDatePer
            currencyTrend['_children'][4][entry.index] = entry.total
            currencyTrend['_children'][5][entry.index] = entry.totalPer

            if (currencyTrend.currency != mainTrend.currency) {
                currencyTrend['_children'][6][entry.index] = entry.rate
            }
        }
        delete currencyTrend.entries
    }
    new Tabulator("#trendTable", {
        data: trendSource, //assign data to table
        columns: columns,
        dataTree: true,
    });
}

function displayTrendChart(summary) {
    const ctx = document.getElementById('trendChart');

    currencyTrends = JSON.parse(JSON.stringify(summary.trend));
    mainTrend = currencyTrends.find((val) => val.main)
    new Chart(ctx, {
        data: {
            labels: mainTrend.entries.map((val) => `${val.month} - ${val.year}`),
            datasets: currencyTrends.map((trend) => {
                return {
                    type: trend.main ? 'line' : 'bar',
                    label: trend.title,
                    data: trend.entries.map((val) => trend.main ? val.amount : val.conversion)
                }
            })
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function displayProportionChart(summary) {
    const ctx = document.getElementById('proportionChart');

    proporsions = JSON.parse(JSON.stringify(summary.proporsion));
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: proporsions.map((val) => `${val.account} - ${val.percentage.toFixed(2)}%`),
            datasets: [
                {
                    data: proporsions.map((val) => val.conversion)
                }
            ]
        }

    });
}




async function main() {
   
}

$(document).ready(function () {
    $('#form').submit(async function (e) {
        e.preventDefault()
        var crendential = $("#form :input").serializeArray();
        var data = await fetchData(crendential[0].value,crendential[1].value);
        if(data){
            $('#password-form').hide()
            var summary = await buildSummary(data)
            displayAccountTable(data)
            displayTrendTable(summary);
            displayTrendChart(summary)
            displayProportionChart(summary)
        }
    })
})