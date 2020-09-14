import React from 'react';
import { StackedBarChart, StackedBarSeries, Bar, RangeLines } from 'reaviz';
import './Odds.css';

function cell(d, dindex) {
  return {
    key: "" + dindex,
    data: d};
}

function row(p, index) {
  return {
    key: " " + (index + 1),
    data: p.map(cell),
    y: "% Probability"
  };
}

function shuffle(a) {
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = a[i];
      a[i] = a[j];
      a[j] = x;
  }
  return a;
}

function calculate(s, a, b, c, d, p, ha, hb, hc, hd, hp) {
  if (a == null || isNaN(a)) {
    a = 0;
  }
  if (b == null || isNaN(b)) {
    b = 0;
  }
  if (c == null || isNaN(c)) {
    c = 0;
  }
  if (d == null || isNaN(d)) {
    d = 0;
  }
  if (p == null || isNaN(p)) {
    p = 0;
  }
  if (s == null || isNaN(s) || s < a+b+c+d+p) {
    s = a+b+c+d+p;
  }
  let partyByDraw = Array(s).fill(0).map(x => Array(5).fill(0));
  let deck = new Array(s);
  deck.fill("Z");
  deck.fill("A", 0, a);
  deck.fill("B", a, a+b);
  deck.fill("C", a+b, a+b+c);
  deck.fill("D", a+b+c, a+b+c+d);
  deck.fill("P", a+b+c+d, a+b+c+d+p)
  var needs = []
  var startingParty = 0
  if (ha) {
    startingParty += 1;
  } else {
    needs.push("A");
  }
  if (hb) {
    startingParty += 1;
  } else {
    needs.push("B");
  }
  if (hc) {
    startingParty += 1;
  } else {
    needs.push("C");
  }
  if (hd) {
    startingParty += 1;
  } else {
    needs.push("D");
  }
  startingParty += hp;
  const trials = 100000;
  for (var t = 0; t < trials; t++) {
    shuffle(deck);
    var firsts = needs.map(v => deck.indexOf(v))
    firsts.filter(v => v !== -1);
    var party = startingParty;
    for (var i = 0; i < s; i++) {
      if (firsts.includes(i) || deck[i] === "P") {
        party += 1;
        if (party > 4) {
          party = 4;
        }
      }
      partyByDraw[i][party] += 1;
    }
  }
  return partyByDraw.map(row => row.map(count => count / trials * 100));
}

const clerics = require('../clerics.json');
const rogues = require('../rogues.json');
const warriors = require('../warriors.json');
const wizards = require('../wizards.json');
const wilds = require('../wilds.json');
const cardToClass = {}
clerics.map(card => cardToClass[card] = "clerics")
rogues.map(card => cardToClass[card] = "rogues")
warriors.map(card => cardToClass[card] = "warriors")
wizards.map(card => cardToClass[card] = "wizards")
wilds.map(card => cardToClass[card] = "wilds")

export default class Odds extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      deck: 40,
      clerics: 2,
      rogues: 3,
      warriors: 2,
      wizards: 1,
      paragons: 0,
      haveparagons: 0
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(event) {
    const target = event.target;
    const checked = target.checked;
    const name = target.name;
    this.setState({
      [name]: checked
    });
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    if (name === "upload") {
      this.processUpload(value);
    } else {
      this.setState({
        [name]: parseInt(value)
      });
    }
  }

  processUpload(upload) {
    var deck = upload.split("\n");
    const sideboardIndex = deck.indexOf("Sideboard");
    if (sideboardIndex !== -1) {
      deck = deck.slice(0, sideboardIndex);
    }
    var counts = {
      deck: 0,
      clerics: 0,
      rogues: 0,
      warriors: 0,
      wizards: 0,
      wilds: 0
    };
    deck.reduce(((counts, line) => {
      if (line !== "" && line.charAt(0) >= '0' && line.charAt(0) <= '9' ) {
        const withoutSetInfo = line.split("(")[0];
        const number = parseInt(withoutSetInfo.split()[0]);
        const name = withoutSetInfo.substring(withoutSetInfo.indexOf(" ") + 1).trim();
        if (cardToClass.[name] !== undefined) {
          console.log(cardToClass.[name]);  
          counts.[cardToClass.[name]] += number;
        }
        counts.deck += number;
      }
      return counts;
    }), counts);
    console.log(counts);
    this.setState(counts);
  }

  render() {
    const partyByDraw = calculate(this.state.deck, this.state.clerics, this.state.rogues, this.state.warriors, this.state.wizards, this.state.paragons, this.state.haveclerics, this.state.haverogues, this.state.havewarriors, this.state.havewizards, this.state.haveparagons);
    var data = partyByDraw.map(row);
    return <div className="page">
      <div className="explanation">
      <p>This chart shows the probability of seeing enough classes for each size of party.<br/>The number of cards seen is the X axis of the chart, and the Y axis is percent probabilities. Each color represents a different sized party.<br/>You can change the numbers in the boxes above the chart or paste your deck below the chart.<br/>You can set options along the bottom to represent already having a class or wild.<br/>Note: seen cards aren't always on the battlefield, so your party may be smaller!</p>
      </div>
      <div className="form">
        <label html-for="deck"> Cards in deck: </label><input className="numbox" type="number" id="deck" name="deck" min="0" defaultValue="40" onChange={this.handleInputChange} value={this.state.deck} />
        <label html-for="clerics"> Clerics: </label><input className="numbox" type="number" id="clerics" name="clerics" min="0" defaultValue="2" onChange={this.handleInputChange} value={this.state.clerics} />
        <label html-for="rogues"> Rogues: </label><input className="numbox" type="number" id="rogues" name="rogues" min="0" defaultValue="3" onChange={this.handleInputChange} value={this.state.rogues} />
        <label html-for="warriors"> Warriors: </label><input className="numbox" type="number" id="warriors" name="warriors" min="0" defaultValue="2" onChange={this.handleInputChange} value={this.state.warriors} />
        <label html-for="wizards"> Wizards: </label><input className="numbox" type="number" id="wizards" name="wizards" min="0" defaultValue="1" onChange={this.handleInputChange} value={this.state.wizards} />
        <label html-for="paragons"> Wilds: </label><input className="numbox" type="number" id="paragons" name="paragons" min="0" defaultValue="0" onChange={this.handleInputChange} value={this.state.wilds} />
      </div>
      <StackedBarChart
              data={data}
              series={
                <StackedBarSeries
                  bar={
                    <Bar
                      key="stacked-normalized-bar"
                      rx={0}
                      ry={0}
                      rounded={false}
                      padding={0}
                      gradient={false}
                      rangeLines={<RangeLines position="top" strokeWidth={3} />}
                      guide={false}
                    />
                  }
                  colorScheme={["#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c"]}
                />
              }
              height={450} />
      <div className="legend">
        <div className="legendEntry">
          <svg width="20" height="20">
            <rect width="20" height="20" style={{fill: "#1f77b4"}} />
          </svg> = Party of 0
        </div>
        <div className="legendEntry">
          <svg width="20" height="20">
            <rect width="20" height="20" style={{fill: "#aec7e8"}} />
          </svg> = Party of 1
        </div>
        <div className="legendEntry">
          <svg width="20" height="20">
            <rect width="20" height="20" style={{fill: "#ff7f0e"}} />
          </svg> = Party of 2
          </div>
        <div className="legendEntry">
          <svg width="20" height="20">
            <rect width="20" height="20" style={{fill: "#ffbb78"}} />
          </svg> = Party of 3
          </div>
        <div className="legendEntry">
          <svg width="20" height="20">
            <rect width="20" height="20" style={{fill: "#2ca02c"}} />
          </svg> = Party of 4
        </div>
      </div>
      <div className="form">
        <label html-for="upload"> Paste deck: </label><textarea className="upload" type="string" id="upload" name="upload" onChange={this.handleInputChange} />
      </div>
      <div className="form page">
        Already Have -
        <label html-for="haveclerics"> Clerics:</label><input className="checkbox" type="checkbox" id="haveclerics" name="haveclerics" onClick={this.handleClick} />
        <label html-for="haverogues"> Rogues:</label><input className="checkbox" type="checkbox" id="haverogues" name="haverogues" onClick={this.handleClick} />
        <label html-for="havewarriors"> Warriors:</label><input className="checkbox" type="checkbox" id="havewarriors" name="havewarriors" onClick={this.handleClick} />
        <label html-for="havewizards"> Wizards:</label><input className="checkbox" type="checkbox" id="havewizards" name="havewizards" onClick={this.handleClick} />
        <label html-for="haveparagons"> Wilds: </label><input className="numbox" type="number" id="haveparagons" name="haveparagons" min="0" defaultValue="0" onChange={this.handleInputChange} />
      </div>
    </div>;
  }
}