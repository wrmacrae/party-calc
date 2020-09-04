import React from 'react';
import { BarChart } from 'react-d3-components';
import './Odds.css';

function cell(d, dindex) {
  return {x: "" + (dindex+1), y: d};
}

function row(p, index) {
  return {
    label: "" + index,
    values: p.map(cell)
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

function calculate(s, a, b, c, d) {
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
  if (s == null || isNaN(s) || s < a+b+c+d) {
    s = a+b+c+d;
  }
  let partyByDraw = Array(5).fill(0).map(x => Array(s).fill(0));
  let deck = new Array(s);
  deck.fill("Z");
  deck.fill("A", 0, a);
  deck.fill("B", a, a+b);
  deck.fill("C", a+b, a+b+c);
  deck.fill("D", a+b+c, a+b+c+d);
  const trials = 100000;
  for (var t = 0; t < trials; t++) {
    shuffle(deck);
    var firsts = ["A", "B", "C", "D"].map(v => deck.indexOf(v))
    firsts.filter(v => v !== -1);
    var party = 0;
    for (var i = 0; i < s; i++) {
      if (firsts.includes(i)) {
        party += 1;
      }
      partyByDraw[party][i] += 1;
    }
  }
  return partyByDraw.map(row => row.map(count => count / trials * 100));
}

function tooltip (x, y0, y, total) {
      return <div className="tooltip">{(Math.round(y*10)/10).toString() + "%"}</div>;
}

export default class Odds extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      deck: 40,
      clerics: 2,
      rogues: 3,
      warriors: 2,
      wizards: 1
    };

    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: parseInt(value)
    });
  }

  render() {
    const partyByDraw = calculate(this.state.deck, this.state.clerics, this.state.rogues, this.state.warriors, this.state.wizards);
    var data = partyByDraw.map(row);
    return <div>
      <div className="form">
        <label html-for="deck"> Cards in deck: </label><input className="numbox" type="number" id="deck" name="deck" min="0" defaultValue="40" onChange={this.handleInputChange} />
        <label html-for="clerics"> Clerics: </label><input className="numbox" type="number" id="clerics" name="clerics" min="0" defaultValue="2" onChange={this.handleInputChange} />
        <label html-for="rogues"> Rogues: </label><input className="numbox" type="number" id="rogues" name="rogues" min="0" defaultValue="3" onChange={this.handleInputChange} />
        <label html-for="warriors"> Warriors: </label><input className="numbox" type="number" id="warriors" name="warriors" min="0" defaultValue="2" onChange={this.handleInputChange} />
        <label html-for="wizards"> Wizards: </label><input className="numbox" type="number" id="wizards" name="wizards" min="0" defaultValue="1" onChange={this.handleInputChange} />
      </div>
      <BarChart
              data={data}
              width={1500}
              height={400}
              tooltipHtml={tooltip}
              tooltipOffset={{top: -50, left: 0}}
              yAxis={{tickFormat: y => {return ""}}}
              margin={{top: 10, bottom: 50, left: 50, right: 10}}/>
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
    </div>;
  }
}