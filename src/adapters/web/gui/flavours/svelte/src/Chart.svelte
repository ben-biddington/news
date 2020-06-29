<script>
    const d3 = require('d3');
    import { onMount } from 'svelte';

    let visible = false;

    // https://observablehq.com/@d3/lets-make-a-bar-chart
    // https://riccardoscalco.it/textures/
    const create = () => {
      const data = [4, 8, 15, 16, 23, 42];

      const div = d3.create("div")
        .style("font", "10px sans-serif")
        .style("text-align", "right")
        .style("color", "white");

      div.selectAll("div")
        .data(data)
        .join("div")
        .style("background", "steelblue")
        .style("padding", "3px")
        .style("margin", "1px")
        .style("width", d => `${d * 10}px`)
        .text(d => d);

      return div.node();
    }

    onMount(() => {
      if (visible) {
        document.querySelector("#example-chart").appendChild(create());
      }
    })
</script>

<div id="example-chart"></div>