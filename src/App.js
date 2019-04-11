import React, { Component } from 'react';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';


class App extends Component {
  constructor() {
    super();
    this.state = {
      selected_pref: Array(47).fill(false),
      prefectures: {},
      series: []
    };
    this.changePrefSelect = this.changePrefSelect.bind(this);
  }

  componentDidMount() {
    fetch('https://opendata.resas-portal.go.jp/api/v1/prefectures', {
      headers: { 'X-API-KEY': 'F6NJ8KWjjnpTzkk47savZg1USOSc1d6EQV3FStlJ' }
    })
      .then(response => response.json())
      .then(res => {
        this.setState({ prefectures: res.result });
      });
  }

  changePrefSelect(index) {
    const selectedWrap = this.state.selected_pref.slice();
    selectedWrap[index] = !selectedWrap[index];

    if (!this.state.selected_pref[index]) {
      fetch(
        `https://opendata.resas-portal.go.jp/api/v1/population/composition/perYear?cityCode=-&prefCode=${index +
          1}`,
        {
          headers: { 'X-API-KEY': 'F6NJ8KWjjnpTzkk47savZg1USOSc1d6EQV3FStlJ' }
        }
      )
        .then(response => response.json())
        .then(res => {
          let humanCount = [];
          Object.keys(res.result.data[0].data).forEach(i => {
            humanCount.push(res.result.data[0].data[i].value);
          });
          const resSeries = {
            name: this.state.prefectures[index].prefName,
            data: humanCount
          };
          this.setState({
            selected_pref: selectedWrap,
            series: [...this.state.series, resSeries]
          });
        });
    } else {
      const series_copy = this.state.series.slice();
      for (let i = 0; i < series_copy.length; i++) {
        if (series_copy[i].name == this.state.prefectures[index].prefName) {
          series_copy.splice(i, 1);
        }
      }
      this.setState({
        selected_pref: selectedWrap,
        series: series_copy
      });
    }
  }

  renderElem(props) {
    return (
      <div class="chkbox" key={props.prefCode}>
        <input id={props.prefCode - 1} type="checkbox" checked={this.state.selected_pref[props.prefCode - 1]}  onChange={() => this.changePrefSelect(props.prefCode - 1)} />
        <label for={props.prefCode - 1}>{props.prefName}</label>
      </div>
    );
  }

  render() {
    const prefObj = this.state.prefectures;
    const chartOptions = {
      title: {
          text: '都道府県別人口推移'
      },
      yAxis: {
        title: {
          text: '人口数',
        }
      },
      plotOptions: {
        series: {
          pointInterval: 5,
          pointStart: 1960
        }
      },
      legend: {
          layout: 'vertical',
          align: 'right',
          verticalAlign: 'middle'
      },
      series: this.state.series
    };

    return (
      <div>
        <h1 class="title">Population Trends in japan</h1>
        <h2 class="subtitle">都道府県</h2>
        <div class="chkboxWrap">{Object.keys(prefObj)
          .map(i => this.renderElem(prefObj[i]))}</div>
        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
      </div>
    );
  }
}

export default App;
