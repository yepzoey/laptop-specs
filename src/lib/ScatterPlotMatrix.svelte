<script>
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import * as d3 from 'd3';
  
    export let data;
  
    const margin = { top: 30, right: 0, bottom: 0, left: 150 };
    const width = 928;
    const height = width;
    const padding = 30;
    const specs = ["PriceUsd", "Ram", "Inches", "SSD", "HDD", "FlashStorage", "Hybrid"];
    const gridSize = specs.length;
    const size = (width - (gridSize + 1) * padding) / gridSize + padding;
    const paddingFactor = 0.01;
  
    let svg;
    let firstCellRect;
    let cellOffsetTop = 0;
    let xScales = [];
    let yScales = [];
  
    export const selectedOpSys = writable([]);
    export const selectedCompany = writable([]);
    export const selectedGPU = writable([]);
    export const selectedCPU = writable([]);
    export const selectedScreenResolution = writable([]);

    const uniqueOpSys = [...new Set(data.map(d => d.OpSys))];
    const uniqueCompanies = [...new Set(data.map(d => d.Company))];
    const uniqueGPU = [...new Set(data.map(d => d.GPU_company))];
    const uniqueCPU = [...new Set(data.map(d => d.CPU_company))];
    const uniqueScreenResolutions = [...new Set(data.map(d => `${d.ScreenW} x ${d.ScreenH}`))];
  
    const tab20Colors = [
      "#4e79a7", "#f28e2b", "#e15759", "#76b7b2", "#59a14f",
      "#edc948", "#b07aa1", "#ff9da7", "#9c755f", "#bab0ac",
      "#aec7e8", "#ffbb78", "#98df8a", "#ff9896", "#c5b0d5",
      "#c49c94", "#f7b6d2", "#c7c7c7", "#dbdb8d", "#9edae5"
    ];

    const color = d3.scaleOrdinal()
      .domain([...new Set(data.map(d => d.Company))])
      .range(tab20Colors);

    const cellCombinations = d3.cross(d3.range(specs.length), d3.range(specs.length));
  
    const customLabels = {
      "PriceUsd": "Price (USD)",
      "Ram": "RAM (GB)",
      "Inches": "Screen Size (inches)",
      "SSD": "SSD Storage (GB)",
      "HDD": "HDD Storage (GB)"
    };
  
    const formatSpec = { "PriceUsd": d3.format(".1s") };
  
    $: filteredData = data.filter(d => {
    return (
      ($selectedOpSys.length === 0 || $selectedOpSys.includes(d.OpSys)) &&
      ($selectedCompany.length === 0 || $selectedCompany.includes(d.Company)) &&
      ($selectedGPU.length === 0 || $selectedGPU.includes(d.GPU_company)) &&
      ($selectedCPU.length === 0 || $selectedCPU.includes(d.CPU_company)) &&
      ($selectedScreenResolution.length === 0 || $selectedScreenResolution.includes(`${d.ScreenW} x ${d.ScreenH}`))
      );
    });
  
    function initializeScales() {
    xScales = specs.map(spec => {
      const extent = d3.extent(data, d => +d[spec] || 0);
      const pad = (extent[1] - extent[0]) * paddingFactor;
      return d3.scaleLinear()
        .domain([extent[0] - pad, extent[1] + pad])
        .range([padding / 2, size - padding / 2])
        .nice();
    });
  
    yScales = xScales.map(x => x.copy().range([size - padding / 2, padding / 2]));
  }
  
    onMount(() => {
      if (data.length) {
        initializeScales();
        renderChart();
        calculateOffset();
      }
    });
  
    function renderChart() {
      const svgElement = d3.select(svg)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("viewBox", [0, 0, width + margin.left + margin.right, height + margin.top + margin.bottom]);
  
      const chartGroup = svgElement.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
  
      const xAxis = d3.axisBottom()
        .ticks(6)
        .tickSize(size * specs.length);
  
      const yAxis = d3.axisLeft()
        .ticks(6)
        .tickSize(-size * specs.length);
  
      chartGroup.append("g")
        .selectAll("g")
        .data(xScales)
        .join("g")
          .attr("transform", (d, i) => `translate(${i * size},0)`)
          .each(function(d) { d3.select(this).call(xAxis.scale(d)); })
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").attr("stroke", "#ddd"))
        .call(g => g.selectAll(".tick text").remove());
  
      chartGroup.append("g")
        .selectAll("g")
        .data(yScales)
        .join("g")
          .attr("transform", (d, i) => `translate(0,${i * size})`)
          .each(function(d) { d3.select(this).call(yAxis.scale(d)); })
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").attr("stroke", "#ddd"))
        .call(g => g.selectAll(".tick text").remove());
  
      const columnLabels = chartGroup.append("g")
        .attr("class", "column-labels")
        .selectAll("text")
        .data(specs)
        .join("text")
          .attr("x", (d, i) => i * size + size / 2)
          .attr("y", -5)
          .attr("text-anchor", "middle")
          .attr("font-size", "12px")
          .attr("font-weight", "bold")
          .text(d => customLabels[d] || d);
  
      const rowLabels = chartGroup.append("g")
        .attr("class", "row-labels")
        .selectAll("text")
        .data(specs)
        .join("text")
          .attr("x", -15)
          .attr("y", (d, i) => i * size + size / 2)
          .attr("text-anchor", "end")
          .attr("dominant-baseline", "middle")
          .attr("font-size", "12px")
          .attr("font-weight", "bold")
          .text(d => customLabels[d] || d);
  
      const cell = chartGroup.append("g")
        .selectAll("g")
        .data(cellCombinations)
        .join("g")
          .attr("transform", ([i, j]) => `translate(${i * size},${j * size})`);
  
      cell.append("rect")
        .attr("fill", "none")
        .attr("stroke", "#aaa")
        .attr("x", padding / 2 + 0.5)
        .attr("y", padding / 2 + 0.5)
        .attr("width", size - padding)
        .attr("height", size - padding);
  
      cell.each(function([i, j]) {
        const cellGroup = d3.select(this);
  
        cellGroup.selectAll("circle")
          .data(filteredData.filter(d => !isNaN(d[specs[i]]) && !isNaN(d[specs[j]])))
          .join("circle")
            .attr("cx", d => xScales[i](d[specs[i]]))
            .attr("cy", d => yScales[j](d[specs[j]]))
            .attr("r", 3.5)
            .attr("fill", d => color(d.Company))
            .attr("fill-opacity", 0.7);
  
        const xSpec = specs[i];
        const ySpec = specs[j];
        const xFormat = formatSpec[xSpec] || d3.format(",");
        const yFormat = formatSpec[ySpec] || d3.format(",");
  
        cellGroup.append("g")
          .attr("class", "x axis")
          .attr("transform", `translate(0,${size - padding / 2})`)
          .call(d3.axisBottom(xScales[i]).ticks(6).tickSize(0).tickFormat(xFormat))
          .call(g => {
            g.select(".domain").remove();
            g.selectAll(".tick text")
              .attr("font-size", "7px")
              .attr("dy", "1.2em");
          });
  
        cellGroup.append("g")
          .attr("class", "y axis")
          .attr("transform", `translate(${padding / 2},0)`)
          .call(d3.axisLeft(yScales[j]).ticks(6).tickSize(0).tickFormat(yFormat))
          .call(g => {
            g.select(".domain").remove();
            g.selectAll(".tick text")
              .attr("font-size", "7px")
              .attr("dx", "-0.5em");
          });
  
        firstCellRect = cell.node().querySelector("rect");
      });
  
      cell.call(addBrush);
    }
  
    let activeBrushCell = null;
    const selectedData = writable([]);
  
    function addBrush(cell) {
      const brush = d3.brush()
        .extent([[padding / 2, padding / 2], [size - padding / 2, size - padding / 2]])
        .on("start", brushStarted)
        .on("end", brushEnded);
  
      cell.call(brush);
    }
  
    function brushStarted(event, [i, j]) {
      if (activeBrushCell !== this) {
        d3.select(activeBrushCell).call(d3.brush().move, null);
        activeBrushCell = this;
      }
    }
  
    function brushEnded(event, [i, j]) {
      if (event.selection && event.sourceEvent != null) {
        const [[x0, y0], [x1, y1]] = event.selection;
        const xScale = xScales[i];
        const yScale = yScales[j];
  
        const selected = filteredData.filter(d => {
          const cx = xScale(d[specs[i]]);
          const cy = yScale(d[specs[j]]);
          return cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1;
        });
  
        d3.select(svg)
          .selectAll("circle")
          .attr("fill", d => selected.includes(d) ? color(d.Company) : "black")
          .attr("r", d => selected.includes(d) ? 3.5 : 1)
          .attr("fill-opacity", d => selected.includes(d) ? 0.7 : 1)
          .filter(d => selected.includes(d))
          .raise();
        selectedData.set(selected);
      } else {
        d3.select(svg)
          .selectAll("circle")
          .attr("fill", d => color(d.Company))
          .attr("r", 3.5)
          .attr("fill-opacity", 0.7);
        selectedData.set([]);
        activeBrushCell = null;
      }
    }
  
    function calculateOffset() {
      if (svg && firstCellRect) {
        const svgRect = svg.getBoundingClientRect();
        const cellRect = firstCellRect.getBoundingClientRect();
        cellOffsetTop = (cellRect.top - svgRect.top);
      }
    }
  
    function toggleOption(option, store) {
      store.update(selected => {
        if (selected.includes(option)) {
          return selected.filter(item => item !== option);
        } else {
          return [...selected, option];
        }
      });
    }
  
    $: if (filteredData) {
      d3.select(svg).selectAll("*").remove();
      initializeScales();
      renderChart();
    }
  
    function clearFilter() {
      selectedData.set([]);
      activeBrushCell = null;
      selectedOpSys.set([]);
      selectedCompany.set([]);
      selectedGPU.set([]);
      selectedCPU.set([]);
      selectedScreenResolution.set([]);
  
      // Clear all circles to their default style
      d3.select(svg)
        .selectAll("circle")
        .attr("fill", d => color(d.Company))
        .attr("r", 3.5)
        .attr("fill-opacity", 0.7);
  
      // Clear all active brushes across cells
      d3.select(svg)
        .selectAll(".brush")
        .call(d3.brush().move, null);
    }
  
  
  </script>
  
  <div style="
  display: flex; 
  flex-direction: row;
  align-items: center; 
  padding: 10px 15px; 
  gap: 20px; 
  border-radius: 8px; 
  max-width: 100%;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
">

  <!-- Title and Clear Filters Button -->
  <div style="display: flex; align-items: center; gap: 20px;">
    <h3 style="margin: 0; font-size: 1.2em; color: #333;">Filter Options</h3>
    <button 
      on:click={clearFilter} 
      style="
        padding: 8px 12px; 
        border: none; 
        background-color: #007bff; 
        color: white; 
        border-radius: 5px; 
        cursor: pointer;
        font-size: 0.9em;
      "
    >
      Clear Filters
    </button>
  </div>

<!-- Filter Options -->
<div style="display: flex; gap: 10px; flex-wrap: wrap; white-space: nowrap; justify-content: center; align-items: flex-start; flex-grow: 1;">
  
  <!-- OS Filter Dropdown -->
  <details style="flex: 1; min-width: auto; padding: 8px 12px; border: 1px solid #ddd; border-radius: 8px; background-color: white;">
    <summary style="cursor: pointer; font-weight: bold;">
      Operating System
    </summary>
    <div style="margin-top: 5px; background-color: #fff; border: 1px solid #ddd; max-height: 150px; overflow-y: auto;">
      {#each uniqueOpSys as opSys}
        <label style="cursor: pointer; display: flex; align-items: center; gap: 5px; margin: 5px;">
          <input style="cursor: pointer;" type="checkbox" bind:group={$selectedOpSys} value={opSys} />
          {opSys}
        </label>
      {/each}
    </div>
  </details>

  <!-- Company Filter Dropdown -->
  <details style="flex: 1; min-width: auto; padding: 8px 12px; border: 1px solid #ddd; border-radius: 8px; background-color: white;">
    <summary style="cursor: pointer; font-weight: bold;">
      Company
    </summary>
    <div style="margin-top: 5px; background-color: #fff; border: 1px solid #ddd; max-height: 150px; overflow-y: auto;">
      {#each uniqueCompanies as company}
        <label style="cursor: pointer; display: flex; align-items: center; gap: 5px; margin: 5px;">
          <input style="cursor: pointer;" type="checkbox" bind:group={$selectedCompany} value={company} />
          {company}
        </label>
      {/each}
    </div>
  </details>

  <!-- Screen Resolution Filter Dropdown -->
  <details style="flex: 1; min-width: auto; padding: 8px 12px; border: 1px solid #ddd; border-radius: 8px; background-color: white;">
    <summary style="cursor: pointer; font-weight: bold;">
      Screen Resolution
    </summary>
    <div style="margin-top: 5px; background-color: #fff; border: 1px solid #ddd; max-height: 150px; overflow-y: auto;">
      {#each uniqueScreenResolutions as resolution}
        <label style="cursor: pointer; display: flex; align-items: center; gap: 5px; margin: 5px;">
          <input style="cursor: pointer;" type="checkbox" bind:group={$selectedScreenResolution} value={resolution} />
          {resolution}
        </label>
      {/each}
    </div>
  </details>

  <!-- GPU Filter Dropdown -->
  <details style="flex: 1; min-width: auto; padding: 8px 12px; border: 1px solid #ddd; border-radius: 8px; background-color: white;">
    <summary style="cursor: pointer; font-weight: bold;">
      GPU Manufacturer
    </summary>
    <div style="margin-top: 5px; background-color: #fff; border: 1px solid #ddd; max-height: 150px; overflow-y: auto;">
      {#each uniqueGPU as gpu}
        <label style="cursor: pointer; display: flex; align-items: center; gap: 5px; margin: 5px;">
          <input style="cursor: pointer;" type="checkbox" bind:group={$selectedGPU} value={gpu} />
          {gpu}
        </label>
      {/each}
    </div>
  </details>

  <!-- CPU Filter Dropdown -->
  <details style="flex: 1; min-width: auto; padding: 8px 12px; border: 1px solid #ddd; border-radius: 8px; background-color: white;">
    <summary style="cursor: pointer; font-weight: bold;">
      CPU Manufacturer
    </summary>
    <div style="margin-top: 5px; background-color: #fff; border: 1px solid #ddd; max-height: 150px; overflow-y: auto;">
      {#each uniqueCPU as cpu}
        <label style="cursor: pointer; display: flex; align-items: center; gap: 5px; margin: 5px;">
          <input style="cursor: pointer;" type="checkbox" bind:group={$selectedCPU} value={cpu} />
          {cpu}
        </label>
      {/each}
    </div>
  </details>
</div>
</div>

<div style="display: flex; align-items: flex-start;">
  <!-- Scatter Plot SVG -->
  <svg 
    bind:this={svg} 
    style="flex-basis: 100%; height: auto; max-width: 100%; display: block; margin-top: 20px" 
    preserveAspectRatio="xMidYMid meet">
  </svg>

  <!-- Side Panel Container -->
  <div style="
    width: auto;
    margin-left: -5px;
    margin-top: {cellOffsetTop}px;
    font-family: Arial, sans-serif;
  ">

    <!-- Legend Box -->
    <div style="
      margin-bottom: 15px;
      padding: 10px;
      border-radius: 8px;
      background-color: #ffffff;
      border: 1px solid #ddd;
      font-size: 0.5em;
      color: #444;
    ">
      <!-- Legend Title -->
      <h3 style="font-size: 1em; margin: 0 0 10px 0; color: #333;">Company Legend</h3>
      
      <!-- Legend Items in Grid -->
      <div style="
        display: grid;
        grid-template-columns: repeat(3, auto);
        gap: 5px 10px;
      ">
      {#each uniqueCompanies as company}
        <div style="display: flex; align-items: center; margin-right: 10px; margin-bottom: 5px;">
          <!-- Color Swatch -->
          <span style="
            width: 10px;
            height: 10px;
            background-color: {color(company)};
            border-radius: 50%;
            display: inline-block;
            margin-right: 5px;
          "></span>
          <!-- Company Name -->
          <span>{company}</span>
        </div>
      {/each}
    </div>
  </div>

    <!-- Selected Product Details Box -->
    <div style="
      max-height: 400px;
      width: 250px;
      padding: 10px;
      border-radius: 8px;
      background-color: #f9f9f9;
      border: 1px solid #ddd;
      overflow-y: auto;
    ">
      <h3 style="font-size: 1em; margin-bottom: 10px; color: #333;">Selected Product Details</h3>
      <div style="
        padding: 10px;
        max-height: 350px;
        overflow-y: auto;
        box-sizing: border-box;
      ">
      {#if $selectedData.length > 0}
        <ul style="list-style-type: none; padding: 0; margin: 0;">
          {#each $selectedData.slice().sort((a, b) => b.PriceUsd - a.PriceUsd) as d, i}
            <li style="padding: 10px 0; border-bottom: 1px solid #f3f3f3;">
              <details style="cursor: pointer;">
                <summary style="font-weight: bold; font-size: 0.9em; color: #444;">
                  {d.Company} - ${d.PriceUsd.toFixed(2)}
                </summary>
                <div style="cursor: auto; padding: 10px 0 0 15px; font-size: 0.8em; color: #555;">
                  <p style="margin: 5px 0;"><strong>Product:</strong> {d.Product}</p>
                  <p style="margin: 5px 0;"><strong>OS:</strong> {d.OpSys}</p>
                  <p style="margin: 5px 0;"><strong>Screen Size:</strong> {d.Inches}"</p>
                  <p style="margin: 5px 0;"><strong>Resolution:</strong> {d.ScreenW} x {d.ScreenH}</p>
                  <p style="margin: 5px 0;"><strong>RAM:</strong> {d.Ram} GB</p>
                  <p style="margin: 5px 0;"><strong>SSD:</strong> {d.SSD ? d.SSD + ' GB' : 'None'}</p>
                  <p style="margin: 5px 0;"><strong>HDD:</strong> {d.HDD ? d.HDD + ' GB' : 'None'}</p>
                  <p style="margin: 5px 0;"><strong>Flash Storage:</strong> {d.FlashStorage ? d.FlashStorage + ' GB' : 'None'}</p>
                  <p style="margin: 5px 0;"><strong>Hybrid:</strong> {d.Hybrid ? d.Hybrid + ' GB' : 'None'}</p>
                  <p style="margin: 5px 0;"><strong>GPU:</strong> {d.GPU_company} {d.GPU_model}</p>
                  <p style="margin: 5px 0;"><strong>CPU:</strong> {d.CPU_company} {d.CPU_model}</p>
                </div>
              </details>
            </li>
          {/each}
        </ul>
      {:else}
        <p style="color: #888; font-style: italic;">No selection. <br><br> Brush to select points.</p>
      {/if}
    </div>
  </div>
</div>
</div>

  <style>
    details summary {
      font-size: 1em;
      font-weight: bold;
      cursor: pointer;
    }
  </style>
  