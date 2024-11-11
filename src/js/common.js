var mstrong = {};

(function () {
    var ils = new IndustrialLeadSource(document);

    var settings = {};

    settings.touchEnabled = "ontouchstart" in window || (window.DocumentTouch && document instanceof DocumentTouch);

    window.addEventListener("message", function (event) {
        if (event.data.type === "hsFormCallback" && event.data.eventName === "onFormSubmitted" && !window.stockpileIgnore) {
            window.dataLayer.push({
                url: document.location.pathname,
                event: "Hubspot Conversion",
                "hs-form-guid": event.data.id,
            });
        }
        if (event.data.type === "hsFormCallback" && event.data.eventName === "onFormReady") {
            setTimeout(function () {
                var iLS = new IndustrialLeadSource(document);
                var obj = iLS.getStoredValues();
                const fieldsMap = {
                    "utm_source" : "utm_source",
                    "utm_campaign" : "utm_campaign",
                    "utm_medium" : "utm_medium",
                    "utm_term" : "utm_term",
                }
                const keys = Object.keys(fieldsMap);

                keys.forEach((key) =>{
                    const field = document.querySelector(`input[name="${key}"]`)
                    if(field){
                        field.value = obj[fieldsMap[key]];
                        field.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                })
            }, 500);
        }
    });

    // select your header or whatever element you wish
    const header = document.querySelector("#header");

    const headroom = new Headroom(header, {
        offset: 88,
        onUnpin: function () {
           document.body.classList.remove("headroom--pinned");
            document.body.classList.add("headroom--unpinned");
        },
        onPin: function () {
           document.body.classList.remove("headroom--unpinned");
            document.body.classList.add("headroom--pinned");
        },
        onTop: function () {
           document.body.classList.remove("headroom--not-top");
            document.body.classList.add("headroom--top");
        },
        onNotTop: function () {
           document.body.classList.remove("headroom--top");
            document.body.classList.add("headroom--not-top");
        },
    });
    headroom.init();

    document.addEventListener("DOMContentLoaded", () => {
        window.addEventListener("message", function (event) {
            if (event.data.type === "hsFormCallback" && event.data.eventName === "onFormSubmit") {
                window.dataLayer.push({
                    url: document.location.pathname,
                    event: "Hubspot Conversion",
                    "hs-form-guid": event.data.id,
                });
            }
        });

        document.querySelectorAll("[data-ga-event]").forEach((el) => {
            el.addEventListener("click", (ev) => {
                const category = el.dataset.gaEvent,
                    action = el.dataset.gaAction,
                    label = el.dataset.gaLabel || "";

                window.dataLayer.push({
                    event: "gaEvent",
                    category: category,
                    action: action,
                    label: label,
                });
            });
        });

       

        document.querySelectorAll(".main-nav .arrow").forEach((el) => {
            el.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                const submenu = e.currentTarget.parentNode.querySelector('.sub-menu');
                if(submenu){
                    submenu.classList.toggle('active');
                }
                e.currentTarget.classList.toggle('active');
            });
        });
    });

    const firstPartyHosts = ["industrialstrengthmarketing.com"];

    document.querySelectorAll(".links-external a").forEach((el) => {
        const hostname = el.hostname;
        if (!firstPartyHosts.includes(hostname)) {
            el.setAttribute("target", "_blank");
            el.setAttribute("rel", "noopener");
        }
    });

    //video header
    videoHero = document.querySelector("#hero[data-vid]");

    if (videoHero) {
        window.addEventListener("load", function () {
            var html = '<video loop="" autoplay="" muted=""><source src="' + videoHero.dataset.vid + '" /></video>';
            // videoHero.innerHTML = html;
            document.getElementById("hero-container").innerHTML = html;
        });
    }
})();
