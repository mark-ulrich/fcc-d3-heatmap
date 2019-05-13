window.addEventListener('DOMContentLoaded', (e) => {
  getData();
});

const drawGraph = (data) => {
  const chartTitle = 'Monthly Global Land-Surface Temperature';
  const baseTemp = data.baseTemperature;
  const chartDescription = `1753 - 2015: base temperature ${baseTemp}° C`;
  const chartDimensions = { width: 1200, height: 600, padding: 100 };
  const titleX = 170;
  const titleY = 50;
  const descriptionX = 300;
  const descriptionY = 75;
  const cellHeight = 30;

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

  const xDomain = [d3.min(years), d3.max(years)];
  const xRange = [
    chartDimensions.padding,
    chartDimensions.width - chartDimensions.padding
  ];

  const yDomain = [...Array(12).keys()];
  const yRange = yDomain.map(
    (elem) => elem * cellHeight + chartDimensions.padding
  );

  const xScale = d3
    .scaleLinear()
    .domain(xDomain)
    .range(xRange);
  const yScale = d3
    .scaleOrdinal()
    .domain(yDomain)
    .range(yRange);

  drawAxes(data, chartDimensions, cellHeight, months, xScale, yScale, svg);

  // drawYLabel(svg);
  // drawLegend(svg);

  // Draw cells
  svg
    .selectAll('rect')
    .data(data.monthlyVariance)
    .enter()
    .append('rect')
    .attr('class', (d, i) => {
      const temp = baseTemp + d.variance;
      if (temp >= 10) {
        return 'cell ' + 'cell-level-4';
      } else if (temp >= 7.5) {
        return 'cell ' + 'cell-level-3';
      } else if (temp >= 5) {
        return 'cell ' + 'cell-level-2';
      } else return 'cell ' + 'cell-level-1';
    })
    .attr('data-month', (d) => d.month - 1)
    .attr('data-year', (d) => d.year)
    .attr('data-temp', (d) => d.variance)
    .attr('x', (d) => parseInt(xScale(d.year)))
    .attr('y', (d) => parseInt(yScale(d.month - 1)))
    .attr('width', 5)
    .attr('height', cellHeight);

  initCellEventHandlers(baseTemp);
};

const drawTooltip = (mouseCoords, data, baseTemp) => {
  const offset = { x: 20, y: -20 };

  const tooltip = document.getElementById('tooltip');
  tooltip.style.left = `${mouseCoords.x + offset.x}px`;
  tooltip.style.top = `${mouseCoords.y + offset.y}px`;
  tooltip.style.visibility = 'visible';

  const { year, month, variance } = data;
  const monthName = new Date(0, month, 0).toLocaleDateString('en-US', {
    month: 'long'
  });
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

function drawLegend(svg) {
  const legend = svg.append('svg').attr('id', 'legend');
}

function initCellEventHandlers(baseTemp) {
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
}

function drawYLabel(svg) {
  const yLabelX = 50;
  const yLabelY = 350;
  const yLabel = svg
    .append('text')
    .attr('id', 'y-label')
    .attr('x', yLabelX)
    .attr('y', yLabelY)
    .attr('transform', `rotate(270, ${yLabelX}, ${yLabelY})`)
    .text('Time in Minutes');
}

function drawAxes(
  data,
  chartDimensions,
  cellHeight,
  months,
  xScale,
  yScale,
  svg
) {
  const xAxis = d3.axisBottom(xScale).ticks(10, 'f');
  const yAxis = d3.axisLeft(yScale).tickFormat((month) => {
    return months[month];
  });

  svg
    .append('g')
    .attr('id', 'x-axis')
    .attr(
      'transform',
      `translate(0, ${chartDimensions.height - chartDimensions.padding})`
    )
    .call(xAxis);
  svg
    .append('g')
    .attr('id', 'y-axis')
    .attr('transform', `translate(${chartDimensions.padding}, 0)`)
    .call(yAxis);
}

function drawDescription(svg, descriptionX, descriptionY, chartDescription) {
  svg
    .append('text')
    .attr('id', 'description')
    .attr('x', descriptionX)
    .attr('y', descriptionY)
    .text(chartDescription);
}

function drawTitle(svg, titleX, titleY, chartTitle) {
  svg
    .append('text')
    .attr('id', 'title')
    .attr('x', titleX)
    .attr('y', titleY)
    .text(chartTitle);
}
