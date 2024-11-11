let data = {
    variables: {
        LTVGenerated: {
            numberOfNewSales: 5,
            avgLtvPerSale: 40000,
        },
        marketingCosts: {
            advertising: 10000,
            marketingTeam: 8000,
            marketingTech: 20000,
        },
        email: ''
    },
    inputs: {
        LTVGenerated: [
            {label: "Number of New Sales", model: "numberOfNewSales", help: "Number of new sales"},
            {label: "Avg. LTV Per Sale", model: "avgLtvPerSale", help: "Average lifetime value for a sale"},
        ],
        marketingCosts: [
            {label: "Advertising", model: "advertising", help: "These are actual costs for advertising, which in the industrial sector also includes trade shows. This includes Google search, display and pay-per-click, social media display ads and sponsored or boosted posts, TV and radio, trade directories (like ThomasNet), publications, and more. "},
            {
                label: "Marketing Team",
                model: "marketingTeam",
                help: "This bucket includes marketing department salaries, agency fees and any outside costs. We include department salaries for several reasons, including that it usually accounts for the costs of creating content and content marketing. But you can create a simple pass/fail test without including costs of marketing personnel salaries, which many companies may not want to share internally."
            },
            {label: "Marketing Tech", model: "marketingTech", help: "This is the cost of your toolset, which could include a CRM, inbound automation, analytics, email platforms, and any systems you pay for directly for marketing use.", helpVisible: false},
        ],
    },
    chart: null,
    sendingData: false,
    resultsHidden: true
};

Vue.component('help-icon', {
    data: function () {
        return {
            active: false,
            interval: null,
        };
    },
    props: ['text'],
    template: `
        <div class="tooltip" @click="toggle()" @mouseleave="toggle(false, 1100)">
            <svg viewBox="0 0 20 20" class="inline-block cursor-pointer text-brand-brown" width="16" height="16"><use href="#icon-help" /></svg>
            <div v-bind:class="{hidden: !active}" class="tooltip-label">
                {{text}}
            </div>
        </div>
    `,
    methods: {
        toggle: function (force, delay = 0) {
            let newValue = !this.active;
            clearInterval(this.interval);
            if (typeof force == "boolean") {
                newValue = force;
            }
            if (delay) {
                this.interval = setInterval(() => this.active = newValue, delay);
            } else {
                this.active = newValue;
            }
        }
    }
});

var app = new Vue({
    el: "#app",
    data: data,
    filters: {
        round: function (value) {
            if (!value) return "";
            return Math.round(value).toString();
        },
        formatCurrency(value, round) {
            if (typeof value !== "number") {
                return value;
            }
            if (round) {
                value = Math.round(value);
            }
            const formatter = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 0,
            });

            return formatter.format(value);
        },
    },
    computed: {
        // a computed getter
        LTVGenerated: function () {
            return Math.round(this.variables.LTVGenerated.numberOfNewSales * this.variables.LTVGenerated.avgLtvPerSale);
        },

        marketingRoi: function () {
            const mc = this.marketingCosts;
            const val = (this.LTVGenerated - mc) / mc;
            return Math.round(val * 10) / 10;
        },
        marketingCosts: function () {
            return Math.round(this.variables.marketingCosts.advertising + this.variables.marketingCosts.marketingTeam + this.variables.marketingCosts.marketingTech);
        },
        marketingPercentages: function () {
            const total = this.marketingCosts;
            const advertising = Math.round((this.variables.marketingCosts.advertising / total) * 100);
            const marketingTeam = Math.round((this.variables.marketingCosts.marketingTeam / total) * 100);
            const marketingTech = Math.round((this.variables.marketingCosts.marketingTech / total) * 100);
            return {
                advertising: advertising,
                marketingTeam: marketingTeam,
                marketingTech: marketingTech,
            };
        },
    },

    methods: {
        sendData: function () {
            const showResults = this.showResults;
            const app = this;
            const fields = [
                {
                    "name": "email",
                    "value": this.variables.email
                }
            ];
            const context = {
                "hutk": document.cookie.replace(/(?:(?:^|.*;\s*)hubspotutk\s*\=\s*([^;]*).*$)|^.*$/, "$1") || '',
                    "pageUri": document.location.href,
                    "pageName": document.title
            };

            app.sendingData = true;

            axios.post('https://api.hsforms.com/submissions/v3/integration/submit/480219/fc017676-d7c9-44cb-95a4-f2c848d1826b', {
                fields: fields,
                context: context
            })
                .then(function (response) {
                    // console.log(response);
                    app.sendingData = false;
                    showResults();
                })
                .catch(function (error) {
                    showResults();
                    console.log(error);
                });
        },
        validateForm: function (e) {
            e.preventDefault();
            if (this.variables.email) {
                this.sendData();
            }
        },
        showResults: function () {
            const percentages = this.marketingPercentages;
            const data = {
                labels: ["Advertising", "Marketing Team", "Marketing Tech"],
                datasets: [
                    {
                        data: [percentages.advertising, percentages.marketingTeam, percentages.marketingTech],
                        backgroundColor: ["#6397A8", "#9DDFF5", "#85A88A"],
                    },
                ],
            };

            this.resultsHidden = false;

            if (!this.chart) {
                const ctx = document.getElementById("chart");
                this.chart = new Chart(ctx, {
                    type: "doughnut",
                    data: data
                });
            } else {
                this.chart.data = data;
                this.chart.update();
            }
        },
    },
});
