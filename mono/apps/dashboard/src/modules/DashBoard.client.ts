/* eslint-disable max-lines */

import ApexCharts from "apexcharts";

const getMainChartOptions = () => {
  let mainChartColors = {};

  if (document.documentElement.classList.contains("dark")) {
    mainChartColors = {
      borderColor: "#374151",
      labelColor: "#9CA3AF",
      opacityFrom: 0,
      opacityTo: 0.15,
    };
  } else {
    mainChartColors = {
      borderColor: "#F3F4F6",
      labelColor: "#6B7280",
      opacityFrom: 0.45,
      opacityTo: 0,
    };
  }

  return {
    chart: {
      height: 420,
      type: "area",
      fontFamily: "Inter, sans-serif",
      foreColor: mainChartColors.labelColor,
      toolbar: {
        show: false,
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        enabled: true,
        opacityFrom: mainChartColors.opacityFrom,
        opacityTo: mainChartColors.opacityTo,
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      style: {
        fontSize: "14px",
        fontFamily: "Inter, sans-serif",
      },
    },
    grid: {
      show: true,
      borderColor: mainChartColors.borderColor,
      strokeDashArray: 1,
      padding: {
        left: 35,
        bottom: 15,
      },
    },
    series: [
      {
        name: "Runs",
        data: [23, 14, 55, 30, 17, 22, 33],
        color: "#1A56DB",
      },
      {
        name: "Runs (previous period)",
        data: [10, 53, 5, 22, 27, 56, 42],
        color: "#FDBA8C",
      },
    ],
    markers: {
      size: 5,
      strokeColors: "#ffffff",
      hover: {
        size: undefined,
        sizeOffset: 3,
      },
    },
    xaxis: {
      categories: ["01 Jan", "02 Jan", "03 Jan", "04 Jan", "05 Jan", "06 Jan", "07 Jan"],
      labels: {
        style: {
          colors: [mainChartColors.labelColor],
          fontSize: "14px",
          fontWeight: 500,
        },
      },
      axisBorder: {
        color: mainChartColors.borderColor,
      },
      axisTicks: {
        color: mainChartColors.borderColor,
      },
      crosshairs: {
        show: true,
        position: "back",
        stroke: {
          color: mainChartColors.borderColor,
          width: 1,
          dashArray: 10,
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: [mainChartColors.labelColor],
          fontSize: "14px",
          fontWeight: 500,
        },
        formatter(value) {
          return `${value}`;
        },
      },
    },
    legend: {
      fontSize: "14px",
      fontWeight: 500,
      fontFamily: "Inter, sans-serif",
      labels: {
        colors: [mainChartColors.labelColor],
      },
      itemMargin: {
        horizontal: 10,
      },
    },
    responsive: [
      {
        breakpoint: 1024,
        options: {
          xaxis: {
            labels: {
              show: false,
            },
          },
        },
      },
    ],
  };
};

if (document.getElementById("main-chart")) {
  const chart = new ApexCharts(document.getElementById("main-chart"), getMainChartOptions());
  chart.render();

  // init again when toggling dark mode
  document.addEventListener("dark-mode", () => {
    chart.updateOptions(getMainChartOptions());
  });
}

if (document.getElementById("new-products-chart")) {
  const options = {
    colors: ["#1A56DB", "#FDBA8C"],
    series: [
      {
        name: "Quantity",
        color: "#1A56DB",
        data: [
          { x: "01 Feb", y: 170 },
          { x: "02 Feb", y: 180 },
          { x: "03 Feb", y: 164 },
          { x: "04 Feb", y: 145 },
          { x: "05 Feb", y: 194 },
          { x: "06 Feb", y: 170 },
          { x: "07 Feb", y: 155 },
        ],
      },
    ],
    chart: {
      type: "bar",
      height: "140px",
      fontFamily: "Inter, sans-serif",
      foreColor: "#4B5563",
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        columnWidth: "90%",
        borderRadius: 3,
      },
    },
    tooltip: {
      shared: false,
      intersect: false,
      style: {
        fontSize: "14px",
        fontFamily: "Inter, sans-serif",
      },
    },
    states: {
      hover: {
        filter: {
          type: "darken",
          value: 1,
        },
      },
    },
    stroke: {
      show: true,
      width: 5,
      colors: ["transparent"],
    },
    grid: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    xaxis: {
      floating: false,
      labels: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      show: false,
    },
    fill: {
      opacity: 1,
    },
  };

  const chart = new ApexCharts(document.getElementById("new-products-chart"), options);
  chart.render();
}

if (document.getElementById("sales-by-category")) {
  const options = {
    colors: ["#1A56DB", "#FDBA8C"],
    series: [
      {
        name: "Desktop PC",
        color: "#1A56DB",
        data: [
          { x: "01 Feb", y: 170 },
          { x: "02 Feb", y: 180 },
          { x: "03 Feb", y: 164 },
          { x: "04 Feb", y: 145 },
          { x: "05 Feb", y: 194 },
          { x: "06 Feb", y: 170 },
          { x: "07 Feb", y: 155 },
        ],
      },
      {
        name: "Phones",
        color: "#FDBA8C",
        data: [
          { x: "01 Feb", y: 120 },
          { x: "02 Feb", y: 294 },
          { x: "03 Feb", y: 167 },
          { x: "04 Feb", y: 179 },
          { x: "05 Feb", y: 245 },
          { x: "06 Feb", y: 182 },
          { x: "07 Feb", y: 143 },
        ],
      },
      {
        name: "Gaming/Console",
        color: "#17B0BD",
        data: [
          { x: "01 Feb", y: 220 },
          { x: "02 Feb", y: 194 },
          { x: "03 Feb", y: 217 },
          { x: "04 Feb", y: 279 },
          { x: "05 Feb", y: 215 },
          { x: "06 Feb", y: 263 },
          { x: "07 Feb", y: 183 },
        ],
      },
    ],
    chart: {
      type: "bar",
      height: "420px",
      fontFamily: "Inter, sans-serif",
      foreColor: "#4B5563",
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        columnWidth: "90%",
        borderRadius: 3,
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      style: {
        fontSize: "14px",
        fontFamily: "Inter, sans-serif",
      },
    },
    states: {
      hover: {
        filter: {
          type: "darken",
          value: 1,
        },
      },
    },
    stroke: {
      show: true,
      width: 5,
      colors: ["transparent"],
    },
    grid: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    xaxis: {
      floating: false,
      labels: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      show: false,
    },
    fill: {
      opacity: 1,
    },
  };

  const chart = new ApexCharts(document.getElementById("sales-by-category"), options);
  chart.render();
}

const getSignupsChartOptions = () => {
  let signupsChartColors = {};

  if (document.documentElement.classList.contains("dark")) {
    signupsChartColors = {
      backgroundBarColors: ["#374151", "#374151", "#374151", "#374151", "#374151", "#374151", "#374151"],
    };
  } else {
    signupsChartColors = {
      backgroundBarColors: ["#E5E7EB", "#E5E7EB", "#E5E7EB", "#E5E7EB", "#E5E7EB", "#E5E7EB", "#E5E7EB"],
    };
  }

  return {
    series: [
      {
        name: "Users",
        data: [1334, 2435, 1753, 1328, 1155, 1632, 1336],
      },
    ],
    labels: ["01 Feb", "02 Feb", "03 Feb", "04 Feb", "05 Feb", "06 Feb", "07 Feb"],
    chart: {
      type: "bar",
      height: "140px",
      foreColor: "#4B5563",
      fontFamily: "Inter, sans-serif",
      toolbar: {
        show: false,
      },
    },
    theme: {
      monochrome: {
        enabled: true,
        color: "#1A56DB",
      },
    },
    plotOptions: {
      bar: {
        columnWidth: "25%",
        borderRadius: 3,
        colors: {
          backgroundBarColors: signupsChartColors.backgroundBarColors,
          backgroundBarRadius: 3,
        },
      },
      dataLabels: {
        hideOverflowingLabels: false,
      },
    },
    xaxis: {
      floating: false,
      labels: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      style: {
        fontSize: "14px",
        fontFamily: "Inter, sans-serif",
      },
    },
    states: {
      hover: {
        filter: {
          type: "darken",
          value: 0.8,
        },
      },
    },
    fill: {
      opacity: 1,
    },
    yaxis: {
      show: false,
    },
    grid: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
  };
};

if (document.getElementById("week-signups-chart")) {
  const chart = new ApexCharts(document.getElementById("week-signups-chart"), getSignupsChartOptions());
  chart.render();

  // init again when toggling dark mode
  document.addEventListener("dark-mode", () => {
    chart.updateOptions(getSignupsChartOptions());
  });
}

const getTrafficChannelsChartOptions = () => {
  let trafficChannelsChartColors = {};

  if (document.documentElement.classList.contains("dark")) {
    trafficChannelsChartColors = {
      strokeColor: "#1f2937",
    };
  } else {
    trafficChannelsChartColors = {
      strokeColor: "#ffffff",
    };
  }

  return {
    series: [70, 5, 25],
    labels: ["Desktop", "Tablet", "Phone"],
    colors: ["#16BDCA", "#FDBA8C", "#1A56DB"],
    chart: {
      type: "donut",
      height: 400,
      fontFamily: "Inter, sans-serif",
      toolbar: {
        show: false,
      },
    },
    responsive: [
      {
        breakpoint: 430,
        options: {
          chart: {
            height: 300,
          },
        },
      },
    ],
    stroke: {
      colors: [trafficChannelsChartColors.strokeColor],
    },
    states: {
      hover: {
        filter: {
          type: "darken",
          value: 0.9,
        },
      },
    },
    tooltip: {
      shared: true,
      followCursor: false,
      fillSeriesColor: false,
      inverseOrder: true,
      style: {
        fontSize: "14px",
        fontFamily: "Inter, sans-serif",
      },
      x: {
        show: true,
        formatter(_, { seriesIndex, w }) {
          const label = w.config.labels[seriesIndex];
          return label;
        },
      },
      y: {
        formatter(value) {
          return `${value}%`;
        },
      },
    },
    grid: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
  };
};

if (document.getElementById("traffic-by-device")) {
  const chart = new ApexCharts(document.getElementById("traffic-by-device"), getTrafficChannelsChartOptions());
  chart.render();

  // init again when toggling dark mode
  document.addEventListener("dark-mode", () => {
    chart.updateOptions(getTrafficChannelsChartOptions());
  });
}
