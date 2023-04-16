<div class="container">
  <div class="region-boxes">
    <div class="box">
      <div class="region-id">1</div>
      <div class="side-section">
        <div class="selector">+</div>
        <div class="remaining">27</div>
      </div>
    </div>
    <div class="box">
      <div class="region-id">2</div>
      <div class="side-section">
        <div class="selector">+</div>
        <div class="remaining">11</div>
      </div>
    </div>
    <div class="box">
      <div class="region-id">3</div>
      <div class="side-section">
        <div class="selector">+</div>
        <div class="remaining">??</div>
      </div>
    </div>
    <div class="box">
      <div class="region-id">4</div>
      <div class="side-section">
        <div class="selector">+</div>
        <div class="remaining">0</div>
      </div>
    </div>
    <div class="box">
      <div class="region-id">5</div>
      <div class="side-section">
        <div class="selector">+</div>
        <div class="remaining">13</div>
      </div>
    </div>
    <div class="box">
      <div class="region-id">6</div>
      <div class="side-section">
        <div class="selector">+</div>
        <div class="remaining">??</div>
      </div>
    </div>
    <div class="box">
      <div class="region-id">7</div>
      <div class="side-section">
        <div class="selector">+</div>
        <div class="remaining">??</div>
      </div>
    </div>
    <div class="box">
      <div class="region-id">8</div>
      <div class="side-section">
        <div class="selector">+</div>
        <div class="remaining">??</div>
      </div>
    </div>
    <div class="box selected">
      <div class="region-id">9</div>
      <div class="side-section">
        <div class="selector">></div>
        <div class="remaining">13</div>
      </div>
    </div>
    <div class="box">
      <div class="region-id">10</div>
      <div class="side-section">
        <div class="selector">+</div>
        <div class="remaining">??</div>
      </div>
    </div>
    <div class="box">
      <div class="region-id">11</div>
      <div class="side-section">
        <div class="selector">+</div>
        <div class="remaining">??</div>
      </div>
    </div>
    <div class="box">
      <div class="region-id">12</div>
      <div class="side-section">
        <div class="selector">+</div>
        <div class="remaining">??</div>
      </div>
    </div>
    <div class="box new-revealed">
      <div class="region-id">13</div>
      <div class="side-section">
        <div class="selector">+</div>
        <div class="remaining">54</div>
      </div>
    </div>
    <div class="box">
      <div class="region-id">14</div>
      <div class="side-section">
        <div class="selector">+</div>
        <div class="remaining">??</div>
      </div>
    </div>
    <div class="box">
      <div class="region-id">15</div>
      <div class="side-section">
        <div class="selector">+</div>
        <div class="remaining">??</div>
      </div>
    </div>
    <div class="box">
      <div class="region-id">16</div>
      <div class="side-section">
        <div class="selector">+</div>
        <div class="remaining">??</div>
      </div>
    </div>
  </div>
  <div class="info-section selected">
    <div class="selected-region">
      <span class="title">Selected Region</span><br />
      <span class="info-label">Region ID: <b>9</b></span><br />
      <span class="info-label">Pts Remaining: <b>13</b></span><br />
      <span class="info-label">Items Found:</span><br />
      <div class="found-items">
        <img src="/keyItems/hm01.png" alt="Cut" class="icon" />
        <img src="/keyItems/hm01.png" alt="Cut" class="icon" />
        <img src="/keyItems/hm01.png" alt="Cut" class="icon" />
        <img src="/keyItems/hm01.png" alt="Cut" class="icon" />
        <img src="/keyItems/hm01.png" alt="Cut" class="icon" />
        <img src="/keyItems/hm01.png" alt="Cut" class="icon" />
        <img src="/keyItems/hm01.png" alt="Cut" class="icon" />
        <img src="/keyItems/hm01.png" alt="Cut" class="icon" />
        <img src="/keyItems/hm01.png" alt="Cut" class="icon" />
        <img src="/keyItems/hm01.png" alt="Cut" class="icon" />
        <img src="/keyItems/hm01.png" alt="Cut" class="icon" />
      </div>
    </div>
    References Area
  </div>
</div>

<style>
  .container {
    background-color: grey;
    display: flex;
    max-width: 550px;
  }

  .region-boxes {
    display: flex;
    flex-wrap: wrap;
    max-width: 200px;
  }

  .box {
    background-color: lightgrey;
    border: 2px solid #444;
    flex-basis: calc(50% - 4px);
    display: flex;
    text-align: center;
    position: relative;
  }

  .box.selected {
    border-color: purple;
  }

  .box.new-revealed {
    border-color: green;
  }

  .box.new-revealed .remaining {
    font-weight: bold;
    color: green;
  }

  .region-id {
    flex-grow: 0;
    font-size: 2.5rem;
    line-height: 1.6;
    width: 60px;
  }

  .side-section {
    position: absolute;
    right: 3%;
  }

  .side-section > div {
    font-size: 1.75rem;
  }

  .info-section {
    border: 2px solid black;
    padding: 10px;
    width: 100%;
  }

  .info-section.selected {
    border-color: purple;
  }

  .selected-region {
    font-size: 1.5rem;
  }

  .selected-region > .title {
    font-weight: bold;
    margin-bottom: 10px;
    text-decoration: underline;
  }

  .found-items {
    align-items: center;
    display: flex;
    height: 76px;
    object-fit: contain;
  }

  .found-items > .icon {
    display: inline-block;
  }
</style>
