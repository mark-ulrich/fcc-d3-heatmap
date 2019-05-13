const cellColors = [
  'rgb(49, 54, 149)',
  'rgb(69, 117, 180)',
  'rgb(116, 173, 209)',
  'rgb(171, 217, 233)',
  'rgb(224, 243, 248)',
  'rgb(255, 255, 191)',
  'rgb(254, 224, 144)',
  'rgb(253, 174, 97)',
  'rgb(244, 109, 67)',
  'rgb(215, 48, 39)',
  'rgb(165, 0, 38)'
];

window.addEventListener('DOMContentLoaded', (e) => {
  getData();
});

const drawGraph = (data) => {
  const chartTitle = 'Monthly Global Land-Surface Temperature';
  const baseTemp = data.baseTemperature;
  const chartDescription = `1753 - 2015: base temperature ${baseTemp}° C`;
  const chartDimensions = {
    width: 1620,
    height: 600,
    padding: { top: 100, bottom: 150, right: 100, left: 100 }
  };
  const titleX = 470;
  const titleY = 50;
  const descriptionX = 600;
  const descriptionY = 75;
  let cellWidth;
  let cellHeight;

  // Create the chart svg
  const svg = d3
    .select('#chart-container')
    .append('svg')
    .attr('width', chartDimensions.width)
    .attr('height', chartDimensions.height)
    .attr('class', 'chart');

  drawTitle(svg, titleX, titleY, chartTitle);
  drawDescription(svg, descriptionX, descriptionY, chartDescription);

  // Axes
  const dates = data.monthlyVariance.map((d) => new Date(d.year, d.month, 0));
  const years = dates.map((date) => date.getFullYear());
  const months = dates.map((date) =>
    date.toLocaleDateString('en-US', { month: 'long' })
  );

  const xDomain = years;
  const xRange = [
    chartDimensions.padding.left,
    chartDimensions.width - chartDimensions.padding.right
  ];

  const yDomain = [...Array(12).keys()];
  const yRange = [
    chartDimensions.padding.top,
    chartDimensions.height - chartDimensions.padding.bottom
  ];
  const xScale = d3
    .scaleBand()
    .domain(xDomain)
    .rangeRound(xRange)
    .align(0);
  const yScale = d3
    .scaleBand()
    .domain(yDomain)
    .rangeRound(yRange)
    .align(1);

  drawAxes(chartDimensions, cellWidth, cellHeight, months, xScale, yScale, svg);
  drawYLabel(svg);
  drawXLabel(svg);

  // Draw cells
  cellHeight = (d3.max(yScale.range()) - d3.min(yScale.range())) / 12;
  cellWidth =
    (d3.max(xScale.range()) - d3.min(xScale.range())) / xScale.domain().length;
  drawCells(svg, data, baseTemp, xScale, yScale, cellWidth, cellHeight);

  drawLegend(svg);
  initCellEventHandlers(baseTemp);
};

const drawTooltip = (mouseCoords, data, baseTemp) => {
  const offset = { x: 20, y: -20 };

  const tooltip = document.getElementById('tooltip');
  tooltip.style.left = `${mouseCoords.x + offset.x}px`;
  tooltip.style.top = `${mouseCoords.y + offset.y}px`;
  tooltip.style.visibility = 'visible';

  const { year, month, variance } = data;
  tooltip.setAttribute('data-year', year);
  const monthName = new Date(0, parseInt(month) + 1, 0).toLocaleDateString(
    'en-US',
    {
      month: 'long'
    }
  );
  const temp =
    Math.round((parseFloat(baseTemp) + parseFloat(variance)) * 1000) / 1000;

  let markup = `
    <strong>${year} - ${monthName}</strong><br>
    ${temp}&#8451;<br>
    ${variance >= 0 ? '+' + variance : '' + variance}&#8451;
  `;

  tooltip.innerHTML = markup;
};

const getData = () => {
  const url =
    'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';

  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);

  xhr.onload = () => {
    drawGraph(JSON.parse(xhr.responseText));
  };

  xhr.send();
};

const drawCells = (
  svg,
  data,
  baseTemp,
  xScale,
  yScale,
  cellWidth,
  cellHeight
) => {
  svg
    .selectAll('rect')
    .data(data.monthlyVariance)
    .enter()
    .append('rect')
    .attr('class', 'cell')
    .attr('fill', (d) => getFillColor(baseTemp + d.variance))
    .attr('data-month', (d) => d.month - 1)
    .attr('data-year', (d) => d.year)
    .attr('data-temp', (d) => d.variance)
    .attr('x', (d) => parseInt(xScale(d.year)))
    .attr('y', (d) => parseInt(yScale(d.month - 1)))
    .attr('width', cellWidth)
    .attr('height', cellHeight);
};

const getFillColor = (temp) => {
  if (temp >= 12.8) {
    return cellColors[10];
  } else if (temp >= 11.7) {
    return cellColors[9];
  } else if (temp >= 10.6) {
    return cellColors[8];
  } else if (temp >= 9.5) {
    return cellColors[7];
  } else if (temp >= 8.3) {
    return cellColors[6];
  } else if (temp >= 7.2) {
    return cellColors[5];
  } else if (temp >= 6.1) {
    return cellColors[4];
  } else if (temp >= 5.0) {
    return cellColors[3];
  } else if (temp >= 3.9) {
    return cellColors[2];
  } else if (temp >= 2.8) {
    return cellColors[1];
  } else return cellColors[0];
};

const drawLegend = (svg) => {
  const legendBoxWidth = 40;

  const legend = svg.append('svg').attr('id', 'legend');

  const legendScale = d3
    .scaleOrdinal()
    .domain([2.8, 3.9, 5.0, 6.1, 7.2, 8.3, 9.5, 10.6, 11.7, 12.8]);
  // .range(100, 100 + 11 * legendBoxWidth);
  legendScale.range(
    legendScale.domain().map((val, i) => 100 + i * legendBoxWidth)
  );
  const axis = d3.axisBottom(legendScale);
  legend
    .append('g')
    .attr('transform', `translate(${legendBoxWidth - 0.5},540)`)
    .call(axis);

  legend
    .selectAll('rect')
    .data(cellColors)
    .enter()
    .append('rect')
    .attr('stroke', '#333')
    .attr('x', (d, i) => 100 + legendBoxWidth * i)
    .attr('y', 500)
    .attr('fill', (d) => d)
    .attr('width', legendBoxWidth)
    .attr('height', legendBoxWidth);
};

const initCellEventHandlers = (baseTemp) => {
  const cells = document.querySelectorAll('.cell');
  cells.forEach((cell) => {
    const year = cell.getAttribute('data-year');
    const month = cell.getAttribute('data-month');
    const variance = cell.getAttribute('data-temp');
    cell.addEventListener('mouseover', (e) => {
      drawTooltip(
        { x: e.clientX, y: e.clientY },
        { month, year, variance },
        baseTemp
      );
    });
    cell.addEventListener('mouseleave', (e) => {
      const tooltip = document.getElementById('tooltip');
      if (tooltip) tooltip.style.visibility = 'hidden';
    });
  });
};

const drawYLabel = (svg) => {
  const yLabelX = 30;
  const yLabelY = 300;
  const yLabel = svg
    .append('text')
    .attr('id', 'y-label')
    .attr('x', yLabelX)
    .attr('y', yLabelY)
    .attr('transform', `rotate(270, ${yLabelX}, ${yLabelY})`)
    .text('Month');
};

const drawXLabel = (svg) => {
  const xLabelX = 800;
  const xLabelY = 490;
  const xLabel = svg
    .append('text')
    .attr('id', 'x-label')
    .attr('x', xLabelX)
    .attr('y', xLabelY)
    .text('Year');
};

const drawAxes = (
  chartDimensions,
  cellWidth,
  cellHeight,
  months,
  xScale,
  yScale,
  svg
) => {
  const ticks = xScale.domain().filter((val) => val % 10 === 0);

  const xAxis = d3
    .axisBottom(xScale)
    .tickSizeOuter(0)
    .tickValues(ticks);

  const yAxis = d3
    .axisLeft(yScale)
    .tickSizeOuter(0)
    .tickFormat((month) => {
      return months[month];
    });

  svg
    .append('g')
    .attr('id', 'x-axis')
    .attr(
      'transform',
      `translate(${-0.5}, ${chartDimensions.height -
        chartDimensions.padding.bottom})`
    )
    .call(xAxis);

  // WARNING: ugly hack to fix axis length
  const path = document.getElementById('x-axis').firstElementChild;
  const [start, end] = path.getAttribute('d').split('H');
  const newPath = `${start}H${end - 104}`;
  path.setAttribute('d', newPath);

  svg
    .append('g')
    .attr('id', 'y-axis')
    .attr('transform', `translate(${chartDimensions.padding.left - 1}, .5)`)
    .call(yAxis);
};

const drawDescription = (svg, descriptionX, descriptionY, chartDescription) => {
  svg
    .append('text')
    .attr('id', 'description')
    .attr('x', descriptionX)
    .attr('y', descriptionY)
    .text(chartDescription);
};

const drawTitle = (svg, titleX, titleY, chartTitle) => {
  svg
    .append('text')
    .attr('id', 'title')
    .attr('x', titleX)
    .attr('y', titleY)
    .text(chartTitle);
};
