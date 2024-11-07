<script>
  </script>
  
  <main>
    <h1>Laptop Specifications</h1>
    <p>
        <a href="/laptop-specs" style="color: #007acc; text-decoration: underline;">Back</a>
      </p>
    <section>
      <h2 style="margin-top: 2em;">Project Write-Up</h2>
  
      <h3><strong>Motivation for Visualization</strong></h3>
      <p>
        The motivation behind this project was to design an interactive graphic that enables users to explore and understand a compelling question related to laptop specifications: 
        <em>"How do different laptop specifications relate to one another, and how might these features collectively influence price and performance?"</em> 
        By using a Scatterplot Matrix (SPLOM), users can simultaneously explore various features, such as RAM, storage types, screen size, and price, and investigate potential correlations across these dimensions. The SPLOM layout provides a comprehensive view, supporting the analysis of multi-variable relationships and offering insights into which specifications might impact laptop price.
      </p>
        
      <h3><strong>Design Rationale</strong></h3>
      <p>For visual encoding, I chose color to represent Company, as it’s the most general and succinct way to categorize laptops. When people describe their laptops, they typically refer to the company first, making this encoding intuitive for users to identify brand-related patterns quickly. The SPLOM itself was selected to present all relationships simultaneously, as linked brushing across scatterplots enables users to highlight selected points across the matrix. This linked interaction helps users identify patterns across multiple specs, answering the compelling question of how features interrelate.</p>
  
      <p>In the SPLOM’s default view, all data points are “selected” by default with an opacity of 0.7 and a radius of 3.5, providing a clear view of point density across plots. When brushing, non-brushed points are de-emphasized with a smaller radius of 1 and set to black, while brushed points retain the 0.7 opacity and 3.5 radius and are brought to the top, allowing users to focus on selected data without losing overall context.</p>
  
      <p>To manage categorical variables (e.g., Operating System, GPU Manufacturer, CPU Manufacturer, Screen Resolution), I placed filter checkboxes within dropdowns, keeping the interface clean and simple. This design choice minimizes clutter and keeps options accessible but unobtrusive. For added clarity, I changed the cursor style: clickable text, checkboxes, and dropdowns use a pointer cursor, and brushing within the scatterplot shows a crosshair cursor. These cues help guide users through the available interactions, making it intuitive to understand what they can do within the interface.</p>
  
      <p>For additional details, a product details box displays a list of brushed points in a dropdown format, showing all specifications of the selected laptops. This detail-on-demand feature keeps the main plot area uncluttered while allowing users to access deeper information on demand, enhancing their ability to explore specific product attributes without overwhelming the primary view.</p>
  
      <p>Initially, I considered a simpler scatterplot design with a fixed y-axis (Price) and a changeable x-axis, where users could toggle between different specs to explore individual influences on price. However, this setup limited the multi-dimensional analysis offered by a SPLOM. The SPLOM ultimately provided a superior solution by enabling simultaneous spec comparisons, which was essential for comprehensively addressing the question posed.</p>
  
      <p>An additional intermediate design involved a scatterplot where both x- and y-axes could be chosen dynamically via dropdowns. This setup allowed users to zoom into relationships between specific variables, save selected points, and carry them over to different axis settings. While this approach facilitated in-depth exploration, I found it essentially recreated a SPLOM without offering the same comprehensive view of all relationships. Ultimately, the SPLOM proved to be a more effective solution, as it allowed users to view all variable relationships on a single page.</p>
  
      <p>The SPLOM is also easily adaptable for more specifications. The grid is generated dynamically based on the length of the specs list, enabling seamless scalability for additional features.</p>
  
      <h3><strong>Development Process</strong></h3>
      <p>Working alone on this project allowed flexibility with my schedule, but it also meant I spent significant time refining and testing interactions. I began at the start of last week, dedicating about 15–20 hours spread across the week to build and optimize the SPLOM. The development process involved exploring and scrapping two prior design iterations—a single scatterplot with a fixed y-axis and changeable x-axis, and a scatterplot where both x- and y-axes could be chosen dynamically via dropdowns. Deciding to discard these initial designs took considerable time, but ultimately allowed me to focus on the SPLOM, which provided a clearer and more comprehensive solution to meet the project’s goals.</p>
  
      <p>The most time-intensive tasks involved ensuring responsive design, adjusting window resizing, positioning elements, and reducing DOM loading for smooth performance. If I had more time, I would incorporate a feature allowing users to double-click into a specific cell in the SPLOM, opening a zoomed-in scatterplot for further exploration, aligning with my earlier ideas. By prioritizing these technical adjustments early, I created a responsive and functional visualization that fully meets the project goals.</p>
    </section>
  </main>
  
  <style>
    main {
        font-family: Arial, sans-serif;
        padding: 1em;
    }
    section h3 {
        font-weight: bold;
    }
  </style>