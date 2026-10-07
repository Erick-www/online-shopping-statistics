// ==========================================
// Online Shopping Statistics
// Sequential algorithm:
// read → validate → calculate → show → update charts
// ==========================================


// ---------- Small helpers ----------

const $ = function (id) {
    return document.getElementById(id);
};

const set = function (id, text) {
    $(id).textContent = text;
};

const money = function (n) {
    return "$" + n.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

const pct = function (p) {
    return +(p * 100).toFixed(2) + "%";
};


// ---------- Input fields ----------

const ordersInput = $("ordersInput");
const priceInput = $("priceInput");
const discountInput = $("discountInput");
const electronicsInput = $("electronicsInput");
const clothingInput = $("clothingInput");
const bothInput = $("bothInput");

const basicCategory = $("basicCategory");
const complementCategory = $("complementCategory");


// ---------- Chart colours ----------

const BLUE = "#2563eb";
const ORANGE = "#d97706";
const PURPLE = "#7c3aed";
const GRAY = "#9ca3af";

const categoryLabels = [
    "Electronics Only",
    "Clothing Only",
    "Both Categories",
    "Other"
];

const categoryColors = [
    BLUE,
    ORANGE,
    PURPLE,
    GRAY
];

Chart.defaults.maintainAspectRatio = false;


// ==========================================
// CHARTS
// ==========================================

const revenueChart = new Chart($("revenueChart"), {

    type: "line",

    data: {
        labels: [
            "Jan", "Feb", "Mar", "Apr",
            "May", "Jun", "Jul", "Aug",
            "Sep", "Oct", "Nov", "Dec"
        ],

        datasets: [{
            label: "Revenue ($)",
            data: [],
            borderColor: BLUE,
            backgroundColor: "rgba(37, 99, 235, 0.12)",
            fill: true,
            borderWidth: 2,
            tension: 0.3
        }]
    },

    options: {
        plugins: {
            legend: {
                display: false
            }
        },

        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});


const categoryChart = new Chart($("categoryChart"), {

    type: "bar",

    data: {
        labels: categoryLabels,

        datasets: [{
            label: "Orders",
            data: [],
            backgroundColor: categoryColors
        }]
    },

    options: {
        plugins: {
            legend: {
                display: false
            }
        },

        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});


const comparisonChart = new Chart($("comparisonChart"), {

    type: "doughnut",

    data: {
        labels: categoryLabels,

        datasets: [{
            data: [],
            backgroundColor: categoryColors,
            borderWidth: 1
        }]
    },

    options: {
        plugins: {

            legend: {
                position: "right"
            },

            tooltip: {
                callbacks: {
                    label: function (c) {
                        return c.label + ": " + c.parsed + "%";
                    }
                }
            }
        }
    }
});


const distributionChart = new Chart($("distributionChart"), {

    type: "bar",

    data: {

        labels: [],

        datasets: [{
            label: "Number of Orders",
            data: [],
            backgroundColor: BLUE
        }]
    },

    options: {

        plugins: {
            legend: {
                display: false
            }
        },

        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});


// ==========================================
// MAIN ALGORITHM
// ==========================================

function update() {


    // ---------- 1. Read input data ----------

    const orders = Number(ordersInput.value);
    const price = Number(priceInput.value);
    const discount = Number(discountInput.value);

    const electronics = Number(electronicsInput.value);
    const clothing = Number(clothingInput.value);
    const both = Number(bothInput.value);


    // ---------- 2. Validate data ----------

    const errors = [];

    if (orders < 0) {
        errors.push("Total Orders cannot be negative.");
    }
    else if (orders === 0) {
        errors.push(
            "Total Orders must be greater than 0 to calculate probabilities."
        );
    }

    if (price < 0) {
        errors.push("Average Price cannot be negative.");
    }

    if (discount < 0 || discount > 100) {
        errors.push("Discount must be between 0% and 100%.");
    }

    if (electronics < 0 || clothing < 0 || both < 0) {
        errors.push("Category orders cannot be negative.");
    }

    if (![orders, electronics, clothing, both].every(Number.isInteger)) {
        errors.push("Order counts must be whole numbers.");
    }

    if (both > electronics) {
        errors.push(
            "Both Categories Orders cannot be greater than Electronics Orders."
        );
    }

    if (both > clothing) {
        errors.push(
            "Both Categories Orders cannot be greater than Clothing Orders."
        );
    }

    if (electronics > orders || clothing > orders) {
        errors.push(
            "Electronics or Clothing Orders cannot be greater than Total Orders."
        );
    }

    if (electronics + clothing - both > orders) {
        errors.push(
            "Electronics + Clothing − Both cannot be greater than Total Orders."
        );
    }


    const validation = $("validation");

    validation.hidden = errors.length === 0;

    if (errors.length > 0) {

        validation.innerHTML =
            "<strong>This data is not possible:</strong>" +
            "<ul><li>" +
            errors.join("</li><li>") +
            "</li></ul>" +
            "The results below still show the last valid data.";

        return;
    }


    // ---------- 3. Calculate exclusive categories ----------

    const electronicsOnly = electronics - both;
    const clothingOnly = clothing - both;

    const other =
        orders -
        electronicsOnly -
        clothingOnly -
        both;


    set("catE", electronicsOnly.toLocaleString());

    set(
        "catEcalc",
        electronics + " − " + both + " = " + electronicsOnly
    );

    set("catC", clothingOnly.toLocaleString());

    set(
        "catCcalc",
        clothing + " − " + both + " = " + clothingOnly
    );

    set("catB", both.toLocaleString());

    set(
        "catBcalc",
        "Electronics ∩ Clothing"
    );

    set("catO", other.toLocaleString());

    set(
        "catOcalc",
        orders +
        " − " +
        electronicsOnly +
        " − " +
        clothingOnly +
        " − " +
        both +
        " = " +
        other
    );

    set(
        "sumCheck",
        "✔ " +
        electronicsOnly +
        " + " +
        clothingOnly +
        " + " +
        both +
        " + " +
        other +
        " = " +
        (electronicsOnly + clothingOnly + both + other) +
        " = Total Orders"
    );


    // ---------- 4. Calculate shopping statistics ----------

    const discountAmount =
        price * discount / 100;

    const finalPrice =
        price - discountAmount;

    const revenue =
        orders *
        price *
        (1 - discount / 100);

    const aov =
        revenue / orders;

    const customers =
        Math.round(orders * 0.72);


    set(
        "revenueCalc",
        orders +
        " × " +
        money(price) +
        " × (1 − " +
        discount +
        " / 100)"
    );

    set(
        "revenueFormulaValue",
        money(revenue)
    );

    set(
        "aovCalc",
        money(revenue) +
        " / " +
        orders
    );

    set(
        "aovFormulaValue",
        money(aov)
    );

    set(
        "discountCalc",
        money(price) +
        " × " +
        (discount / 100)
    );

    set(
        "discountFormulaValue",
        money(discountAmount)
    );

    set(
        "customerCalc",
        orders + " × 0.72"
    );

    set(
        "customerFormulaValue",
        customers.toLocaleString()
    );


    set("revenue", money(revenue));
    set("orders", orders.toLocaleString());
    set("average", money(aov));
    set("customers", customers.toLocaleString());


    // ---------- 5. Basic probability ----------

    const pE = electronics / orders;
    const pC = clothing / orders;
    const pBoth = both / orders;
    const pOther = other / orders;


    const groups = {

        electronics: {
            name: "Electronics",
            count: electronics,

            note:
                "Electronics includes Both: " +
                electronics +
                "/" +
                orders +
                " = " +
                pct(pE) +
                ". Electronics Only excludes Both: " +
                electronicsOnly +
                "/" +
                orders +
                " = " +
                pct(electronicsOnly / orders) +
                "."
        },

        clothing: {
            name: "Clothing",
            count: clothing,

            note:
                "Clothing includes Both: " +
                clothing +
                "/" +
                orders +
                " = " +
                pct(pC) +
                ". Clothing Only excludes Both: " +
                clothingOnly +
                "/" +
                orders +
                " = " +
                pct(clothingOnly / orders) +
                "."
        },

        both: {
            name: "Both Categories",
            count: both,

            note:
                "Both = Electronics ∩ Clothing: orders that belong to both categories."
        },

        other: {
            name: "Other",
            count: other,

            note:
                "Other = orders that are neither Electronics nor Clothing."
        }
    };


    const basic =
        groups[basicCategory.value];

    set(
        "basicCalculation",
        "P(" +
        basic.name +
        ") = " +
        basic.count +
        " / " +
        orders +
        " = " +
        pct(basic.count / orders)
    );

    set(
        "basicProbability",
        pct(basic.count / orders)
    );

    set(
        "basicNote",
        basic.note
    );


    // ---------- 6. Complement probability ----------

    const comp =
        groups[complementCategory.value];

    const pComp =
        comp.count / orders;

    set(
        "complementCalculation",
        "P(" +
        comp.name +
        "') = 1 − " +
        comp.count +
        " / " +
        orders +
        " = 1 − " +
        pct(pComp) +
        " = " +
        pct(1 - pComp)
    );

    set(
        "complementProbability",
        pct(1 - pComp)
    );


    // ---------- 7. Independent events ----------

    const pExpected =
        pE * pC;

    const independent =
        Math.abs(pExpected - pBoth) < 0.00005;


    set(
        "independentCalculation",

        "P(E) × P(C) = " +
        pct(pE) +
        " × " +
        pct(pC) +
        " = " +
        pct(pExpected) +
        "\n" +

        "P(E ∩ C) = " +
        both +
        " / " +
        orders +
        " = " +
        pct(pBoth)
    );


    set(
        "independentProbability",
        pct(pExpected)
    );

    set(
        "actualIntersection",
        pct(pBoth)
    );


    const barScale =
        Math.max(pExpected, pBoth) || 1;

    $("barExpected").style.width =
        (pExpected / barScale * 100) + "%";

    $("barActual").style.width =
        (pBoth / barScale * 100) + "%";


    const result =
        $("independentResult");


    if (independent) {

        result.textContent =
            "Conclusion: " +
            pct(pExpected) +
            " = " +
            pct(pBoth) +
            ", so the events are independent.";

    }
    else {

        result.textContent =
            "Conclusion: " +
            pct(pExpected) +
            " ≠ " +
            pct(pBoth) +
            ", so the events are not independent (" +

            (
                pBoth > pExpected
                    ? "they happen together more often than expected)."
                    : "they happen together less often than expected)."
            );
    }


    result.className =
        "conclusion " +
        (independent ? "ok" : "bad");


    // ---------- 8. Addition rule ----------

    const pUnion =
        pE + pC - pBoth;


    set(
        "additionCalculation",

        "Step 1: P(E) + P(C) = " +
        pct(pE) +
        " + " +
        pct(pC) +
        " = " +
        pct(pE + pC) +
        "\n" +

        "Step 2: subtract P(E ∩ C) = " +
        pct(pBoth) +
        "\n" +

        "Step 3: " +
        pct(pE + pC) +
        " − " +
        pct(pBoth) +
        " = " +
        pct(pUnion)
    );


    set(
        "additionProbability",
        pct(pUnion)
    );


    // ---------- 9. Venn diagram ----------

    set("vEOnly", electronicsOnly);
    set("vBoth", both);
    set("vCOnly", clothingOnly);

    set(
        "vOther",
        "Other (outside both circles): " +
        other +
        " (" +
        pct(pOther) +
        ")"
    );

    set("vUnion", pct(pUnion));
    set("vInter", pct(pBoth));
    set("vEc", pct(1 - pE));
    set("vCc", pct(1 - pC));


    // ---------- 10. Probability summary ----------

    set("sumE", pct(pE));
    set("sumC", pct(pC));
    set("sumBoth", pct(pBoth));
    set("sumOther", pct(pOther));
    set("sumUnion", pct(pUnion));
    set("sumProduct", pct(pExpected));
    set("sumInter", pct(pBoth));

    set(
        "sumConclusion",

        independent
            ? "Conclusion: Electronics and Clothing are independent."
            : "Conclusion: Electronics and Clothing are not independent."
    );


    // ==========================================
    // 11. STATISTICAL ANALYSIS
    // ==========================================

    /*
        Create order-value dataset.

        The previous version created values linearly:
        65%, 65.07%, 65.14% ... 135%

        That distribution was symmetrical,
        therefore Mean and Median were often identical.

        Now we use a slightly right-skewed distribution:
        most orders are closer to the lower range,
        while fewer orders have higher values.
    */

    const values = [];

    const totalValues =
        Math.min(orders, 1000);


    for (let i = 0; i < totalValues; i++) {

        const position =
            totalValues > 1
                ? i / (totalValues - 1)
                : 0;


        const orderValue =
            finalPrice *
            (
                0.55 +
                Math.pow(position, 1.8) * 1.00
            );


        values.push(orderValue);
    }


    // Sort values from smallest to largest

    values.sort(function (a, b) {
        return a - b;
    });


    // ---------- Mean ----------

    const mean =
        values.reduce(
            function (sum, value) {
                return sum + value;
            },
            0
        ) / values.length;


    // ---------- Minimum ----------

    const minimum =
        values[0];


    // ---------- Maximum ----------

    const maximum =
        values[values.length - 1];


    // ---------- Range ----------

    const range =
        maximum - minimum;


    // ---------- Median ----------

    const middle =
        Math.floor(values.length / 2);


    const median =
        values.length % 2 === 0

            ? (
                values[middle - 1] +
                values[middle]
            ) / 2

            : values[middle];


    // ---------- Standard Deviation ----------

    const squaredDifferences =
        values.reduce(
            function (sum, value) {

                return sum +
                    Math.pow(value - mean, 2);

            },
            0
        );


    const deviation =
        Math.sqrt(
            squaredDifferences /
            values.length
        );


    // ---------- Show statistics ----------

    set("mean", money(mean));
    set("median", money(median));
    set("minimum", money(minimum));
    set("maximum", money(maximum));
    set("range", money(range));
    set("deviation", money(deviation));


    // ==========================================
    // 12. UPDATE CHARTS
    // ==========================================


    // ---------- Monthly revenue ----------

    const monthlyShare = [
        0.06,
        0.07,
        0.08,
        0.09,
        0.07,
        0.08,
        0.09,
        0.10,
        0.08,
        0.10,
        0.11,
        0.07
    ];


    revenueChart.data.datasets[0].data =
        monthlyShare.map(function (share) {
            return revenue * share;
        });

    revenueChart.update();


    // ---------- Category chart ----------

    const exclusive = [
        electronicsOnly,
        clothingOnly,
        both,
        other
    ];


    categoryChart.data.datasets[0].data =
        exclusive;

    categoryChart.update();


    // ---------- Category probability chart ----------

    comparisonChart.data.datasets[0].data =
        exclusive.map(function (number) {

            return +(
                number / orders * 100
            ).toFixed(2);

        });

    comparisonChart.update();


    // ---------- Order value distribution ----------

    const bins = 5;

    const width =
        range / bins;

    const digits =
        width >= 1 ? 0 : 2;

    const counts = [
        0,
        0,
        0,
        0,
        0
    ];

    const binLabels = [];


    // Create interval labels

    for (let i = 0; i < bins; i++) {

        binLabels.push(
            "$" +
            (
                minimum +
                i * width
            ).toFixed(digits) +

            "–" +

            (
                minimum +
                (i + 1) * width
            ).toFixed(digits)
        );
    }


    // Count orders in each interval

    for (let i = 0; i < values.length; i++) {

        let bin =
            width === 0
                ? 0
                : Math.floor(
                    (values[i] - minimum) /
                    width
                );


        if (bin >= bins) {
            bin = bins - 1;
        }


        counts[bin]++;
    }


    distributionChart.data.labels =
        binLabels;

    distributionChart.data.datasets[0].data =
        counts;

    distributionChart.update();
}


// ==========================================
// EVENT LISTENERS
// ==========================================

document.addEventListener(
    "input",
    update
);

document.addEventListener(
    "change",
    update
);


// ==========================================
// INITIAL UPDATE
// ==========================================

update();