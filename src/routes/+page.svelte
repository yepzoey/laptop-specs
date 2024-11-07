<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import ScatterPlotMatrix from '../lib/ScatterPlotMatrix.svelte';

  let data = [];
  const euroToUsdRate = 1.1;

  onMount(async () => {
    try {
      const res = await fetch('/laptop-specs/laptop_prices.csv');
      const csv = await res.text();
      data = d3.csvParse(csv, d => {
        let SSD = 0;
        let HDD = 0;
        let FlashStorage = 0;
        let Hybrid = 0;

        // PrimaryStorage based on type
        if (d.PrimaryStorageType === "SSD") {
          SSD += +d.PrimaryStorage;
        } else if (d.PrimaryStorageType === "HDD") {
          HDD += +d.PrimaryStorage;
        } else if (d.PrimaryStorageType === "Flash Storage") {
          FlashStorage += +d.PrimaryStorage;
        } else if (d.PrimaryStorageType === "Hybrid") {
          Hybrid += +d.PrimaryStorage;
        }

        // SecondaryStorage based on type
        if (d.SecondaryStorageType === "SSD") {
          SSD += +d.SecondaryStorage;
        } else if (d.SecondaryStorageType === "HDD") {
          HDD += +d.SecondaryStorage;
        } else if (d.SecondaryStorageType === "Flash Storage") {
          FlashStorage += +d.SecondaryStorage;
        } else if (d.SecondaryStorageType === "Hybrid") {
          Hybrid += +d.SecondaryStorage;
        }

        return {
          Company: d.Company,
          Product: d.Product,
          Inches: +d.Inches,
          Ram: d.Ram,
          OpSys: d.OS,
          Screen: d.Screen,
          ScreenW: d.ScreenW,
          ScreenH: d.ScreenH,
          CPU_company: d["CPU_company"],
          CPU_model: d["CPU_model"],
          SSD: SSD,
          HDD: HDD,
          FlashStorage: FlashStorage,
          Hybrid: Hybrid,
          GPU_company: d["GPU_company"],
          GPU_model: d["GPU_model"],
          PriceUsd: +d["Price_euros"] * euroToUsdRate
        };
      });
      console.log("Data loaded:", data.length);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  });
</script>

<main>
  <h1>Laptop Specifications</h1>

  {#if data.length > 0}
    <ScatterPlotMatrix {data} />
  {:else}
    <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);">
      <h3>Loading data...</h3>
      <img src="/laptop-specs/tangyload.gif" alt="Loading..." style="width: 100px; height: 100px;" />
    </div>
  {/if}
</main>

<style>
  main {
    font-family: Arial, sans-serif;
    padding: 1em;
  }
  h1 {
    color: #333;
  }
</style>
